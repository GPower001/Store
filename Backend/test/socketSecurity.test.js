import test from "node:test";
import assert from "node:assert/strict";
import {
  branchRoomName,
  createSocketSecurity,
  registerSocketHandlers,
} from "../utils/socketSecurity.js";

const TENANT_A = "aaaaaaaaaaaaaaaaaaaaaaaa";
const TENANT_B = "bbbbbbbbbbbbbbbbbbbbbbbb";
const BRANCH_A1 = "111111111111111111111111";
const BRANCH_A2 = "222222222222222222222222";
const BRANCH_B1 = "333333333333333333333333";
const USER_ADMIN_A = "aaaaaaaa1111111111111111";
const USER_STAFF_A = "aaaaaaaa2222222222222222";

const query = (value) => ({
  select() {
    return this;
  },
  then(resolve, reject) {
    return Promise.resolve(value).then(resolve, reject);
  },
});

const createFixture = () => {
  const users = new Map([
    [USER_ADMIN_A, {
      _id: USER_ADMIN_A,
      tenantId: TENANT_A,
      branchId: BRANCH_A1,
      role: "Admin",
      isActive: true,
    }],
    [USER_STAFF_A, {
      _id: USER_STAFF_A,
      tenantId: TENANT_A,
      branchId: BRANCH_A1,
      role: "Staff",
      isActive: true,
    }],
  ]);
  const tenants = new Map([
    [TENANT_A, { _id: TENANT_A, status: "active" }],
    [TENANT_B, { _id: TENANT_B, status: "active" }],
  ]);
  const branches = [
    { _id: BRANCH_A1, tenantId: TENANT_A, isActive: true },
    { _id: BRANCH_A2, tenantId: TENANT_A, isActive: true },
    { _id: BRANCH_B1, tenantId: TENANT_B, isActive: true },
  ];
  const tokens = new Map([
    ["admin-a", {
      id: USER_ADMIN_A,
      tenantId: TENANT_B,
      branchId: BRANCH_B1,
      role: "Staff",
      exp: Math.floor(Date.now() / 1000) + 3600,
    }],
    ["staff-a", {
      id: USER_STAFF_A,
      tenantId: TENANT_B,
      branchId: BRANCH_B1,
      role: "Admin",
      exp: Math.floor(Date.now() / 1000) + 3600,
    }],
    ["expired-a", { id: USER_ADMIN_A, exp: Math.floor(Date.now() / 1000) - 1 }],
    ["challenge-a", {
      id: USER_ADMIN_A,
      purpose: "2fa-login",
      exp: Math.floor(Date.now() / 1000) + 3600,
    }],
  ]);
  const revokedTokens = new Set();
  const security = createSocketSecurity({
    verifyToken(token) {
      const decoded = tokens.get(token);
      if (!decoded || decoded.exp <= Math.floor(Date.now() / 1000)) {
        throw new Error("Invalid or expired token");
      }
      return decoded;
    },
    UserModel: {
      findById(id) {
        return query(users.get(id) || null);
      },
    },
    TenantModel: {
      findById(id) {
        return query(tenants.get(id) || null);
      },
    },
    BranchModel: {
      findOne(filter) {
        return query(branches.find((branch) =>
          branch._id === filter._id
          && branch.tenantId === filter.tenantId
          && branch.isActive === filter.isActive
        ) || null);
      },
    },
    TokenBlacklistModel: {
      findOne({ token }) {
        return query(revokedTokens.has(token) ? { token } : null);
      },
    },
  });

  return { users, tenants, revokedTokens, security };
};

const createSocket = (token) => {
  const handlers = new Map();
  const rooms = new Set();
  const received = [];
  return {
    data: { authToken: token },
    handlers,
    rooms,
    received,
    disconnected: false,
    on(event, handler) {
      handlers.set(event, handler);
    },
    async join(room) {
      rooms.add(room);
    },
    emit(event, data) {
      received.push({ event, data });
    },
    disconnect() {
      this.disconnected = true;
      rooms.clear();
    },
    async send(event, data) {
      return handlers.get(event)?.(data);
    },
  };
};

const createRoomServer = (sockets) => ({
  in(room) {
    return {
      async fetchSockets() {
        return sockets.filter((socket) => socket.rooms.has(room));
      },
    };
  },
});

const runAuthentication = (security, token) => new Promise((resolve) => {
  const socket = {
    handshake: { auth: { token }, headers: {} },
    data: {},
  };
  security.authenticateSocket(socket, (error) => resolve({ error, socket }));
});

test("tenant A cannot join tenant B branch or receive its private stock events", async () => {
  const { security } = createFixture();
  const socket = createSocket("admin-a");
  registerSocketHandlers(socket, security.authorizeBranch);

  await socket.send("join-branch", BRANCH_B1);

  assert.equal(socket.rooms.has(branchRoomName(TENANT_B, BRANCH_B1)), false);
  assert.equal(socket.received.some(({ event }) => event === "branch-join-error"), true);

  const delivered = await security.emitToTenantBranch(
    createRoomServer([socket]),
    TENANT_B,
    BRANCH_B1,
    "new-notification",
    { item: "tenant B confidential stock" },
  );

  assert.equal(delivered, 0);
  assert.equal(socket.received.some(({ event }) => event === "new-notification"), false);
});

test("tenant Admin can join another active branch in their own tenant and receive its event", async () => {
  const { security } = createFixture();
  const socket = createSocket("admin-a");
  registerSocketHandlers(socket, security.authorizeBranch);

  await socket.send("join-branch", BRANCH_A2);

  assert.equal(socket.rooms.has(branchRoomName(TENANT_A, BRANCH_A2)), true);
  const notification = { item: "tenant A stock" };
  const delivered = await security.emitToTenantBranch(
    createRoomServer([socket]),
    TENANT_A,
    BRANCH_A2,
    "new-notification",
    notification,
  );

  assert.equal(delivered, 1);
  assert.deepEqual(socket.received.at(-1), { event: "new-notification", data: notification });
});

test("branch-scoped staff cannot join a different branch in the same tenant", async () => {
  const { security } = createFixture();
  const socket = createSocket("staff-a");
  registerSocketHandlers(socket, security.authorizeBranch);

  await socket.send("join-branch", BRANCH_A2);

  assert.equal(socket.rooms.has(branchRoomName(TENANT_A, BRANCH_A2)), false);
  assert.equal(socket.received.some(({ event }) => event === "branch-join-error"), true);
  assert.equal(socket.handlers.has("join-room"), false);
});

test("socket authentication derives tenant, branch, and role from current database membership", async () => {
  const { security } = createFixture();
  const { error, socket } = await runAuthentication(security, "admin-a");

  assert.equal(error, undefined);
  assert.equal(socket.data.principal.userId, USER_ADMIN_A);
  assert.equal(socket.data.principal.tenantId, TENANT_A);
  assert.equal(socket.data.principal.branchId, BRANCH_A1);
  assert.equal(socket.data.principal.role, "Admin");
  assert.ok(Number.isFinite(socket.data.principal.expiresAt));
  assert.ok(socket.data.principal.expiresAt > Date.now());
});

test("expired, revoked, and two-factor challenge tokens cannot open sockets", async () => {
  const { security, revokedTokens } = createFixture();
  revokedTokens.add("revoked-a");

  const { error: expiredError } = await runAuthentication(security, "expired-a");
  const { error: revokedError } = await runAuthentication(security, "revoked-a");
  const { error: challengeError } = await runAuthentication(security, "challenge-a");

  assert.ok(expiredError);
  assert.ok(revokedError);
  assert.ok(challengeError);
});

test("a connected socket is disconnected instead of receiving events after token revocation", async () => {
  const { security, revokedTokens } = createFixture();
  const socket = createSocket("admin-a");
  registerSocketHandlers(socket, security.authorizeBranch);
  await socket.send("join-branch", BRANCH_A1);
  revokedTokens.add("admin-a");

  const delivered = await security.emitToTenantBranch(
    createRoomServer([socket]),
    TENANT_A,
    BRANCH_A1,
    "new-notification",
    { item: "revoked session" },
  );

  assert.equal(delivered, 0);
  assert.equal(socket.disconnected, true);
  assert.equal(socket.received.some(({ event }) => event === "new-notification"), false);
});
