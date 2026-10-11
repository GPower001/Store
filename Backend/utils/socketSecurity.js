const normalizeId = (value) => value?.toString() || null;

class SocketAuthenticationError extends Error {}

export const branchRoomName = (tenantId, branchId) =>
  `tenant:${normalizeId(tenantId)}:branch:${normalizeId(branchId)}`;

export const userRoomName = (userId) => `user:${normalizeId(userId)}`;

export const createSocketSecurity = ({
  verifyToken,
  UserModel,
  TenantModel,
  BranchModel,
  TokenBlacklistModel,
}) => {
  const authenticateToken = async (token) => {
    if (typeof token !== "string" || !token) {
      throw new SocketAuthenticationError("Authentication token required");
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new SocketAuthenticationError("Invalid authentication token");
    }
    if (!decoded?.id || decoded.purpose || !Number.isFinite(decoded.exp)) {
      throw new SocketAuthenticationError("Invalid authentication token");
    }

    const revoked = await TokenBlacklistModel.findOne({ token });
    if (revoked) {
      throw new SocketAuthenticationError("Authentication token revoked");
    }

    const user = await UserModel.findById(decoded.id)
      .select("_id tenantId branchId role isActive");
    if (!user || !user.isActive || !user.tenantId) {
      throw new SocketAuthenticationError("Account is unavailable");
    }

    const tenant = await TenantModel.findById(user.tenantId).select("status");
    if (!tenant || !["active", "trial"].includes(tenant.status)) {
      throw new SocketAuthenticationError("Organization is unavailable");
    }

    return {
      userId: normalizeId(user._id),
      tenantId: normalizeId(user.tenantId),
      branchId: normalizeId(user.branchId),
      role: user.role,
      expiresAt: decoded.exp * 1000,
    };
  };

  const authenticateSocket = async (socket, next) => {
    try {
      const authToken = socket.handshake.auth?.token;
      const authorization = socket.handshake.headers?.authorization;
      const bearerToken = typeof authorization === "string"
        ? authorization.match(/^Bearer\s+(.+)$/i)?.[1]
        : null;
      const token = authToken || bearerToken;

      socket.data.authToken = token;
      socket.data.principal = await authenticateToken(token);
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  };

  const authorizeBranch = async (token, branchId) => {
    if (typeof branchId !== "string" || !/^[\da-f]{24}$/i.test(branchId)) {
      return null;
    }

    const principal = await authenticateToken(token);

    const branch = await BranchModel.findOne({
      _id: branchId,
      tenantId: principal.tenantId,
      isActive: true,
    }).select("_id");

    if (!branch) {
      return null;
    }

    const isTenantAdmin = principal.role?.toLowerCase() === "admin";
    if (!isTenantAdmin && principal.branchId !== normalizeId(branch._id)) {
      return null;
    }

    return {
      ...principal,
      branchId: normalizeId(branch._id),
    };
  };

  const emitToTenantBranch = async (io, tenantId, branchId, event, data, excludeUserId = null) => {
    if (!tenantId || !branchId) {
      throw new Error("Tenant and branch are required for private socket events");
    }

    const room = branchRoomName(tenantId, branchId);
    const sockets = await io.in(room).fetchSockets();
    let delivered = 0;

    for (const socket of sockets) {
      let principal;
      try {
        principal = await authorizeBranch(socket.data?.authToken, normalizeId(branchId));
      } catch (error) {
        if (!(error instanceof SocketAuthenticationError)) throw error;
        socket.disconnect(true);
        continue;
      }
      if (
        !principal
        || principal.tenantId !== normalizeId(tenantId)
        || (excludeUserId && principal.userId === normalizeId(excludeUserId))
      ) {
        socket.disconnect(true);
        continue;
      }

      socket.emit(event, data);
      delivered += 1;
    }

    return delivered;
  };

  return {
    authenticateSocket,
    authenticateToken,
    authorizeBranch,
    emitToTenantBranch,
  };
};

export const joinAuthorizedBranch = async (socket, authorizeBranch, requestedBranchId) => {
  const branchId = typeof requestedBranchId === "string"
    ? requestedBranchId
    : requestedBranchId?.branchId;
  const principal = await authorizeBranch(socket.data.authToken, branchId);

  if (!principal) {
    socket.emit("branch-join-error", { error: "Unauthorized branch access" });
    return false;
  }

  await socket.join(branchRoomName(principal.tenantId, principal.branchId));
  socket.emit("joined-branch", {
    branchId: principal.branchId,
    message: "Connected to branch notifications",
  });
  return true;
};

export const registerSocketHandlers = (socket, authorizeBranch) => {
  socket.on("join-branch", (branchId) =>
    joinAuthorizedBranch(socket, authorizeBranch, branchId).catch(() => {
      socket.disconnect(true);
    })
  );

  socket.on("ping", () => socket.emit("pong"));
};
