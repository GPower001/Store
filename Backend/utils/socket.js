// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();
// app.use(express.json());

// app.use(express.urlencoded({ extended: true }));

// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//       origin: [
//         "http://localhost:5173", // Local development frontend
//       ],
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//     transports: ["websocket", "polling"], // Ensure WebSocket is enabled
//     allowUpgrades: true,
//     pingTimeout: 60000,
//     pingInterval: 25000,
//   });

// io.on("connection", (socket) => {
//     console.log("A user connected:", socket.id);

//     // Handle events here
//     socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);
//     });
// });

// export { io, app, server };


import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken"; // Add JWT for authentication

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173", // Local development frontend
            process.env.FRONTEND_URL, // Add production URL from env
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    },
    transports: ["websocket", "polling"],
    allowUpgrades: true,
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Store user sessions and their branch associations
const userSessions = new Map();

// Authentication middleware for Socket.IO
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return next(new Error('Authentication token required'));
        }

        // Verify JWT token (replace with your actual secret)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        socket.userId = decoded.userId;
        socket.branchId = decoded.branchId; // Assuming user has associated branch
        socket.userRole = decoded.role; // For role-based permissions
        
        next();
    } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Invalid authentication token'));
    }
});

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}, UserID: ${socket.userId}, BranchID: ${socket.branchId}`);

    try {
        // Store user session
        userSessions.set(socket.userId, {
            socketId: socket.id,
            branchId: socket.branchId,
            connectedAt: new Date(),
            role: socket.userRole
        });

        // Auto-join user to their branch room for notifications
        if (socket.branchId) {
            socket.join(socket.branchId.toString());
            console.log(`User ${socket.userId} joined branch room: ${socket.branchId}`);
            
            // Emit confirmation
            socket.emit('joined-branch', { 
                branchId: socket.branchId,
                message: 'Connected to branch notifications'
            });
        }

        // Handle manual room joining (if needed for additional rooms)
        socket.on("join-room", (data) => {
            try {
                const { roomId } = data;
                
                // Validate room access (implement your business logic)
                if (canUserJoinRoom(socket.userId, socket.branchId, roomId, socket.userRole)) {
                    socket.join(roomId);
                    socket.emit('room-joined', { roomId, success: true });
                    console.log(`User ${socket.userId} joined room: ${roomId}`);
                } else {
                    socket.emit('room-join-error', { 
                        roomId, 
                        error: 'Unauthorized to join this room' 
                    });
                }
            } catch (error) {
                console.error('Error joining room:', error.message);
                socket.emit('room-join-error', { 
                    error: 'Failed to join room' 
                });
            }
        });

        // Handle leaving rooms
        socket.on("leave-room", (data) => {
            try {
                const { roomId } = data;
                socket.leave(roomId);
                socket.emit('room-left', { roomId, success: true });
                console.log(`User ${socket.userId} left room: ${roomId}`);
            } catch (error) {
                console.error('Error leaving room:', error.message);
                socket.emit('room-leave-error', { error: 'Failed to leave room' });
            }
        });

        // Handle notification acknowledgment
        socket.on("notification-read", (data) => {
            try {
                const { notificationId } = data;
                // Emit to other users in the same branch that notification was read
                socket.to(socket.branchId.toString()).emit('notification-acknowledged', {
                    notificationId,
                    readBy: socket.userId
                });
                console.log(`Notification ${notificationId} marked as read by user ${socket.userId}`);
            } catch (error) {
                console.error('Error handling notification read:', error.message);
            }
        });

        // Handle ping-pong for connection health
        socket.on('ping', () => {
            socket.emit('pong');
        });

        // Handle disconnection
        socket.on("disconnect", (reason) => {
            console.log(`User disconnected: ${socket.id}, UserID: ${socket.userId}, Reason: ${reason}`);
            
            // Clean up user session
            userSessions.delete(socket.userId);
            
            // Notify other users in branch (optional)
            if (socket.branchId) {
                socket.to(socket.branchId.toString()).emit('user-disconnected', {
                    userId: socket.userId,
                    disconnectedAt: new Date()
                });
            }
        });

        // Handle connection errors
        socket.on("error", (error) => {
            console.error(`Socket error for user ${socket.userId}:`, error.message);
        });

    } catch (error) {
        console.error('Error in socket connection handler:', error.message);
        socket.disconnect(true);
    }
});

// Utility function to check room access permissions
function canUserJoinRoom(userId, userBranchId, roomId, userRole) {
    // Implement your business logic here
    // For example:
    
    // Users can always join their own branch room
    if (roomId === userBranchId.toString()) {
        return true;
    }
    
    // Admins can join any room
    if (userRole === 'admin' || userRole === 'superadmin') {
        return true;
    }
    
    // Add more specific rules based on your application needs
    return false;
}

// Helper function to get online users in a branch
export const getOnlineUsersInBranch = (branchId) => {
    const onlineUsers = [];
    for (const [userId, session] of userSessions.entries()) {
        if (session.branchId.toString() === branchId.toString()) {
            onlineUsers.push({
                userId,
                socketId: session.socketId,
                connectedAt: session.connectedAt,
                role: session.role
            });
        }
    }
    return onlineUsers;
};

// Helper function to emit to specific user
export const emitToUser = (userId, event, data) => {
    const userSession = userSessions.get(userId);
    if (userSession) {
        io.to(userSession.socketId).emit(event, data);
        return true;
    }
    return false;
};

// Helper function to emit to all users in a branch
export const emitToBranch = (branchId, event, data, excludeUserId = null) => {
    const room = branchId.toString();
    if (excludeUserId) {
        const userSession = userSessions.get(excludeUserId);
        if (userSession) {
            io.to(room).except(userSession.socketId).emit(event, data);
        }
    } else {
        io.to(room).emit(event, data);
    }
};

export { io, app, server, userSessions };