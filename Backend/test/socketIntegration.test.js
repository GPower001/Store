import test, { before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { existsSync, statfsSync } from "node:fs";
import { tmpdir } from "node:os";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import { io as createClient } from "socket.io-client";
import { server, io, disconnectUserSockets, emitToBranch } from "../utils/socket.js";
import User from "../models/userModel.js";
import Tenant from "../models/Tenant.js";
import Branch from "../models/branchModel.js";
import Notification from "../models/notificationModel.js";
import TokenBlacklist from "../models/TokenBlacklist.js";
import notificationService from "../services/notificationService.js";
import { branchRoomName } from "../utils/socketSecurity.js";

const DATABASE_NAME = "phase1_socket_integration_test";
const TEST_SECRET = "phase1-only-integration-secret-never-used-outside-tests";
const TIMEOUT_MS = 5000;
const NEGATIVE_EVENT_WINDOW_MS = 250;
const clients = new Set();
const collections = [User, Tenant, Branch, Notification, TokenBlacklist];
let memoryServer;
let baseUrl;
let databaseReady = false;
let tenantA;
let tenantB;
let branchA1;
let branchA2;
let inactiveBranchA;
let branchB1;
let adminA;
let adminA2;
let staffA;
let managerA;
let adminB;

const withTimeout = (promise, label, timeoutMs = TIMEOUT_MS) => {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timed out waiting for ${label}`)), timeoutMs);
    }),
  ]).finally(() => clearTimeout(timer));
};

const waitForEvent = (emitter, event, timeoutMs = TIMEOUT_MS) =>
  withTimeout(new Promise((resolve) => emitter.once(event, resolve)), event, timeoutMs);

const waitForClientEvent = (client, event) =>
  waitForEvent(client, event).then((data) => ({ event, data }));

const delay = (timeoutMs) => new Promise((resolve) => setTimeout(resolve, timeoutMs));

const makeToken = (user, expiresIn = "1h") =>
  jwt.sign({ id: user._id }, TEST_SECRET, { expiresIn });

const makeTenant = async (key) => Tenant.create({
  companyName: `Integration ${key}`,
  industry: "Retail",
  city: "Test City",
  state: "Test State",
  email: `${key}@test.invalid`,
  subdomain: `integration-${key}`,
  status: "active",
});

const makeBranch = async (tenant, name, isActive = true) => Branch.create({
  name,
  tenantId: tenant._id,
  isActive,
});

const makeUser = async (tenant, branch, name, role = "Staff") => User.create({
  name,
  email: `${name.toLowerCase()}@test.invalid`,
  password: "integration-test-password",
  role,
  tenantId: tenant._id,
  branchId: branch?._id,
  isActive: true,
});

const connectClient = async (token) => {
  const client = createClient(baseUrl, {
    auth: { token },
    transports: ["websocket"],
    reconnection: false,
    timeout: TIMEOUT_MS,
  });
  client.receivedEvents = [];
  for (const event of [
    "joined-branch",
    "branch-join-error",
    "new-notification",
    "notification-updated",
    "notifications-bulk-updated",
    "notification-deleted",
    "notifications-bulk-deleted",
  ]) {
    client.on(event, (data) => client.receivedEvents.push({ event, data }));
  }
  clients.add(client);

  const connected = waitForEvent(client, "connect");
  const joined = waitForEvent(client, "joined-branch");
  await Promise.all([connected, joined]);
  return client;
};

const serverSocketFor = (client) => io.of("/").sockets.get(client.id);

const createNotification = (branch, tenant, message) => Notification.create({
  type: "low-stock",
  message,
  item: message,
  tenantId: tenant._id,
  branchId: branch._id,
});

before(async () => {
  assert.notEqual(process.env.NODE_ENV, "production", "integration tests must not run in production");
  assert.equal(mongoose.connection.readyState, 0, "test must own an isolated Mongoose connection");
  process.env.JWT_SECRET = TEST_SECRET;

  const diskStats = statfsSync(tmpdir());
  const availableBytes = diskStats.bavail * diskStats.bsize;
  const systemBinary = process.env.MONGOMS_SYSTEM_BINARY;
  const hasSystemBinary = Boolean(systemBinary && existsSync(systemBinary));
  const minimumFreeBytes = hasSystemBinary
    ? 2 ** 28
    : process.platform === "win32" ? 2 ** 31 : 2 ** 30;
  assert.ok(
    availableBytes >= minimumFreeBytes,
    `isolated MongoDB tests need at least ${Math.ceil(minimumFreeBytes / 2 ** 30)} GiB free in the temporary directory`,
  );

  memoryServer = await MongoMemoryServer.create({
    instance: {
      dbName: DATABASE_NAME,
      ip: "127.0.0.1",
    },
    binary: { version: "7.0.14" },
  });
  const isolatedUri = memoryServer.getUri();
  const parsedUri = new URL(isolatedUri);
  assert.ok(
    ["127.0.0.1", "localhost", "::1"].includes(parsedUri.hostname),
    "test database must be bound to loopback only",
  );
  await mongoose.connect(isolatedUri, {
    dbName: DATABASE_NAME,
    serverSelectionTimeoutMS: TIMEOUT_MS,
  });
  assert.equal(mongoose.connection.name, DATABASE_NAME);
  await Promise.all(collections.map((model) => model.init()));

  await withTimeout(new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  }), "local Socket.IO server startup");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  databaseReady = true;
});

beforeEach(async () => {
  assert.ok(databaseReady, "isolated test MongoDB and local Socket.IO server must be ready");
  await Promise.all(collections.map((model) => model.deleteMany({})));

  tenantA = await makeTenant("a");
  tenantB = await makeTenant("b");
  branchA1 = await makeBranch(tenantA, "A1");
  branchA2 = await makeBranch(tenantA, "A2");
  inactiveBranchA = await makeBranch(tenantA, "A-inactive", false);
  branchB1 = await makeBranch(tenantB, "B1");
  adminA = await makeUser(tenantA, branchA1, "admin-a", "Admin");
  adminA2 = await makeUser(tenantA, branchA2, "admin-a2", "Admin");
  staffA = await makeUser(tenantA, branchA1, "staff-a", "Staff");
  managerA = await makeUser(tenantA, branchA1, "manager-a", "Manager");
  adminB = await makeUser(tenantB, branchB1, "admin-b", "Admin");
});

afterEach(async () => {
  for (const client of clients) {
    if (!client.connected) {
      client.disconnect();
      continue;
    }
    const disconnected = waitForEvent(client, "disconnect");
    client.disconnect();
    await disconnected;
  }
  clients.clear();
  if (!databaseReady) return;
  await Promise.all(collections.map((model) => model.deleteMany({})));
});

after(async () => {
  await new Promise((resolve) => io.close(resolve));
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  await memoryServer?.stop();
});

test("real sockets authenticate and enforce branch room membership and private-event isolation", async () => {
  const admin = await connectClient(makeToken(adminA));
  const staff = await connectClient(makeToken(staffA));
  const manager = await connectClient(makeToken(managerA));
  const otherTenantAdmin = await connectClient(makeToken(adminB));
  const adminOtherBranch = await connectClient(makeToken(adminA2));

  assert.ok(serverSocketFor(admin).rooms.has(branchRoomName(tenantA._id, branchA1._id)));

  const deniedFor = (client) => {
    const rejected = waitForEvent(client, "branch-join-error");
    client.emit("join-branch", branchA2._id.toString());
    return rejected;
  };
  await deniedFor(staff);
  await deniedFor(manager);

  const adminJoined = waitForEvent(admin, "joined-branch");
  admin.emit("join-branch", branchA2._id.toString());
  await adminJoined;
  assert.ok(serverSocketFor(admin).rooms.has(branchRoomName(tenantA._id, branchA2._id)));

  const foreignJoin = waitForEvent(otherTenantAdmin, "branch-join-error");
  otherTenantAdmin.emit("join-branch", branchA1._id.toString());
  await foreignJoin;

  const inactiveJoin = waitForEvent(admin, "branch-join-error");
  admin.emit("join-branch", inactiveBranchA._id.toString());
  await inactiveJoin;

  const adminRoomsBeforeLegacyAttempt = new Set(serverSocketFor(admin).rooms);
  admin.emit("join-room", branchB1._id.toString());
  await delay(NEGATIVE_EVENT_WINDOW_MS);
  assert.deepEqual(new Set(serverSocketFor(admin).rooms), adminRoomsBeforeLegacyAttempt);
  assert.equal(
    serverSocketFor(admin).rooms.has(branchRoomName(tenantB._id, branchB1._id)),
    false,
  );

  const beforeA = admin.receivedEvents.length;
  const beforeA2 = adminOtherBranch.receivedEvents.length;
  const beforeB = otherTenantAdmin.receivedEvents.length;
  const deliveryCount = await emitToBranch(
    tenantB._id,
    branchB1._id,
    "new-notification",
    { message: "tenant B only" },
  );
  await delay(NEGATIVE_EVENT_WINDOW_MS);
  assert.equal(deliveryCount, 1);
  assert.equal(admin.receivedEvents.length, beforeA);
  assert.equal(adminOtherBranch.receivedEvents.length, beforeA2);
  assert.equal(otherTenantAdmin.receivedEvents.length, beforeB + 1);

  const assignedBranch = branchRoomName(tenantA._id, branchA2._id);
  assert.ok(serverSocketFor(admin).rooms.has(assignedBranch));
});

test("expired and revoked tokens are rejected by the real Socket.IO handshake", async () => {
  const expired = makeToken(adminA, "-1s");
  const revoked = makeToken(adminA);
  await TokenBlacklist.create({
    token: revoked,
    userId: adminA._id,
    expiresAt: new Date(Date.now() + 60_000),
  });

  for (const token of [expired, revoked]) {
    const client = createClient(baseUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnection: false,
      timeout: TIMEOUT_MS,
    });
    clients.add(client);
    await waitForEvent(client, "connect_error");
    assert.equal(client.connected, false);
  }
});

test("logout disconnects all sockets for the target user and leaves another user connected", async () => {
  const firstSession = await connectClient(makeToken(adminA));
  const secondSession = await connectClient(makeToken(adminA));
  const unrelatedUser = await connectClient(makeToken(adminB));
  const firstDisconnected = waitForEvent(firstSession, "disconnect");
  const secondDisconnected = waitForEvent(secondSession, "disconnect");

  disconnectUserSockets(adminA._id);

  await Promise.all([firstDisconnected, secondDisconnected]);
  assert.equal(unrelatedUser.connected, true);
});

test("connected sockets are reauthorized after user, tenant, token, or branch changes", async () => {
  const scenarios = [
    {
      name: "role changes to branch-scoped",
      user: adminA,
      joinBranchId: branchA2._id,
      targetBranch: branchA2,
      update: () => User.updateOne({ _id: adminA._id }, { role: "Staff" }),
    },
    {
      name: "user is disabled",
      update: () => User.updateOne({ _id: staffA._id }, { isActive: false }),
    },
    {
      name: "tenant is suspended",
      update: () => Tenant.updateOne({ _id: tenantA._id }, { status: "suspended" }),
    },
    {
      name: "token is revoked",
      update: async (token) => TokenBlacklist.create({
        token,
        userId: staffA._id,
        expiresAt: new Date(Date.now() + 60_000),
      }),
    },
    {
      name: "branch assignment is removed",
      update: () => User.updateOne({ _id: staffA._id }, { branchId: branchA2._id }),
    },
  ];

  for (const scenario of scenarios) {
    const user = scenario.user || staffA;
    const token = makeToken(user);
    const client = await connectClient(token);
    if (scenario.joinBranchId) {
      const joined = waitForEvent(client, "joined-branch");
      client.emit("join-branch", scenario.joinBranchId.toString());
      await joined;
    }
    const disconnected = waitForEvent(client, "disconnect");
    await scenario.update(token);

    const targetBranch = scenario.targetBranch || branchA1;
    const delivered = await emitToBranch(
      tenantA._id,
      targetBranch._id,
      "new-notification",
      { message: scenario.name },
    );

    assert.equal(delivered, 0);
    await disconnected;
    assert.equal(
      client.receivedEvents.some((received) => received.data?.message === scenario.name),
      false,
    );

    if (scenario.name === "user is disabled") {
      await User.updateOne({ _id: staffA._id }, { isActive: true });
    } else if (scenario.name === "tenant is suspended") {
      await Tenant.updateOne({ _id: tenantA._id }, { status: "active" });
    } else if (scenario.name === "token is revoked") {
      await TokenBlacklist.deleteMany({ userId: staffA._id });
    } else {
      await User.updateOne({ _id: staffA._id }, { branchId: branchA1._id });
    }
  }
});

test("notification updates, read changes, bulk updates, and deletes reach only the associated branch", async () => {
  const branchClient = await connectClient(makeToken(adminA));
  const sameTenantOtherBranch = await connectClient(makeToken(adminA2));
  const otherTenantClient = await connectClient(makeToken(adminB));
  const operations = [
    {
      event: "notification-updated",
      run: async () => {
        const record = await createNotification(branchA1, tenantA, "update target");
        const received = waitForClientEvent(branchClient, "notification-updated");
        await notificationService.updateNotification(record._id.toString(), branchA1._id.toString(), {
          message: "updated notification",
        });
        return { received, expectedMessage: "updated notification" };
      },
    },
    {
      event: "notification-updated",
      run: async () => {
        const record = await createNotification(branchA1, tenantA, "read target");
        const received = waitForClientEvent(branchClient, "notification-updated");
        await notificationService.markAsRead(record._id.toString(), branchA1._id.toString());
        return { received, expectedRead: true };
      },
    },
    {
      event: "notifications-bulk-updated",
      run: async () => {
        await createNotification(branchA1, tenantA, "bulk update target");
        const received = waitForClientEvent(branchClient, "notifications-bulk-updated");
        await notificationService.markAllAsRead(branchA1._id.toString());
        return { received, expectedAction: "mark-all-read" };
      },
    },
    {
      event: "notification-deleted",
      run: async () => {
        const record = await createNotification(branchA1, tenantA, "delete target");
        const received = waitForClientEvent(branchClient, "notification-deleted");
        await notificationService.deleteNotification(record._id.toString(), branchA1._id.toString());
        return { received, expectedDeletedId: record._id.toString() };
      },
    },
    {
      event: "notifications-bulk-deleted",
      run: async () => {
        const record = await createNotification(branchA1, tenantA, "bulk delete target");
        const received = waitForClientEvent(branchClient, "notifications-bulk-deleted");
        await notificationService.deleteMultipleNotifications(
          [record._id.toString()],
          branchA1._id.toString(),
        );
        return { received, expectedDeletedCount: 1 };
      },
    },
  ];

  for (const operation of operations) {
    const startBranch = branchClient.receivedEvents.length;
    const startSameTenantOtherBranch = sameTenantOtherBranch.receivedEvents.length;
    const startOtherTenant = otherTenantClient.receivedEvents.length;
    const result = await operation.run();
    const event = await result.received;
    assert.equal(event.event, operation.event);
    if (result.expectedMessage) assert.equal(event.data.message, result.expectedMessage);
    if (result.expectedRead) assert.equal(event.data.isRead, true);
    if (result.expectedAction) assert.equal(event.data.action, result.expectedAction);
    if (result.expectedDeletedId) {
      assert.equal(event.data.notificationId, result.expectedDeletedId);
    }
    if (result.expectedDeletedCount) {
      assert.equal(event.data.deletedCount, result.expectedDeletedCount);
    }

    await delay(NEGATIVE_EVENT_WINDOW_MS);
    assert.ok(branchClient.receivedEvents.length > startBranch);
    assert.equal(sameTenantOtherBranch.receivedEvents.length, startSameTenantOtherBranch);
    assert.equal(otherTenantClient.receivedEvents.length, startOtherTenant);
  }
});

test("notification updates surface socket delivery failures instead of reporting success", async () => {
  const branchClient = await connectClient(makeToken(adminA));
  const record = await createNotification(branchA1, tenantA, "delivery failure target");
  const originalIn = io.in;
  io.in = () => {
    throw new Error("simulated socket adapter failure");
  };

  try {
    await assert.rejects(
      notificationService.updateNotification(record._id.toString(), branchA1._id.toString(), {
        message: "persisted but not broadcast",
      }),
      /Failed to emit notification-updated/,
    );
  } finally {
    io.in = originalIn;
  }

  const persisted = await Notification.findById(record._id);
  assert.equal(persisted.message, "persisted but not broadcast");
  assert.equal(
    branchClient.receivedEvents.some(({ event, data }) =>
      event === "notification-updated" && data.message === "persisted but not broadcast"
    ),
    false,
  );
});
