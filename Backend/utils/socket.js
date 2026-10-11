import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import User from "../models/userModel.js";
import Tenant from "../models/Tenant.js";
import Branch from "../models/branchModel.js";
import TokenBlacklist from "../models/TokenBlacklist.js";
import {
    branchRoomName,
    createSocketSecurity,
    joinAuthorizedBranch,
    registerSocketHandlers,
    userRoomName,
} from "./socketSecurity.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [process.env.FRONTEND_URL_PROD, process.env.FRONTEND_URL_DEV, "http://localhost:5173"].filter(Boolean),
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    },
    transports: ["websocket", "polling"],
    allowUpgrades: true,
    pingTimeout: 60000,
    pingInterval: 25000,
});

const userSessions = new Map();
const socketSecurity = createSocketSecurity({
    verifyToken: (token) => {
        if (!process.env.JWT_SECRET) {
            throw new Error("Server authentication is not configured");
        }
        return jwt.verify(token, process.env.JWT_SECRET);
    },
    UserModel: User,
    TenantModel: Tenant,
    BranchModel: Branch,
    TokenBlacklistModel: TokenBlacklist,
});

io.use(socketSecurity.authenticateSocket);

io.on("connection", (socket) => {
    const principal = socket.data.principal;
    const userSockets = userSessions.get(principal.userId) || new Set();
    userSockets.add(socket);
    userSessions.set(principal.userId, userSockets);
    socket.join(userRoomName(principal.userId));

    const expiryTimer = setTimeout(
        () => socket.disconnect(true),
        Math.max(0, principal.expiresAt - Date.now())
    );
    expiryTimer.unref?.();

    registerSocketHandlers(socket, socketSecurity.authorizeBranch);
    socket.on("disconnect", () => {
        clearTimeout(expiryTimer);
        const activeSockets = userSessions.get(principal.userId);
        activeSockets?.delete(socket);
        if (activeSockets?.size === 0) userSessions.delete(principal.userId);
    });

    if (principal.branchId) {
        joinAuthorizedBranch(socket, socketSecurity.authorizeBranch, principal.branchId).catch(() => {
            socket.disconnect(true);
        });
    }
});

export const getOnlineUsersInBranch = (branchId) => {
    const onlineUsers = [];
    for (const [userId, sockets] of userSessions.entries()) {
        for (const socket of sockets) {
            if (socket.data.principal.branchId === branchId.toString()) {
                onlineUsers.push({
                    userId,
                    socketId: socket.id,
                    connectedAt: socket.handshake.time,
                    role: socket.data.principal.role,
                });
            }
        }
    }
    return onlineUsers;
};

export const emitToUser = (userId, event, data) => {
    const userSockets = userSessions.get(userId.toString());
    if (!userSockets?.size) return false;
    io.in(userRoomName(userId)).emit(event, data);
    return true;
};

export const emitToBranch = (tenantId, branchId, event, data, excludeUserId = null) =>
    socketSecurity.emitToTenantBranch(io, tenantId, branchId, event, data, excludeUserId);

export const disconnectUserSockets = (userId) =>
    io.in(userRoomName(userId)).disconnectSockets(true);

export { io, app, server, userSessions };
