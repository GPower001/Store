// import dotenv from "dotenv";
// import path from "path";
// import { app, server, io } from "./utils/socket.js";
// import express from "express"
// import cors from "cors";
// import cron from "node-cron";

// import connectDB from "./config/db.js";
// import swaggerDocs from "./swagger.js";
// import authRoutes from "./routes/authRoutes.js";
// import itemRoutes from "./routes/itemRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
// // import upload from "./middlewares/uploadMiddleware.js"; // ❌ REMOVE THIS
// import checkLowStock from "./utils/checkLowStock.js";
// import branchRoutes from "./routes/branchRoutes.js"; 
// import adminRoutes from "./routes/AdminRoute.js";
// import stockMovementRoutes from "./routes/StockMovementRoutes.js";




// dotenv.config();

// // --------------------
// // Database
// // --------------------
// connectDB().catch((err) => {
//   console.error("Database connection failed:", err);
//   process.exit(1);
// });

// // --------------------
// // CORS setup
// // --------------------
// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://127.0.0.1:5173",
//   "http://localhost:4173",
//   process.env.FRONTEND_URL,
//   "https://inventory-sycr.onrender.com",
// ];

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true); // allow Postman/cURL
//     if (allowedOrigins.includes(origin)) return callback(null, true);
//     console.error("❌ Blocked by CORS:", origin);
//     callback(new Error("Not allowed by CORS"));
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization", "x-branch-id"],
// };

// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// // app.use(upload.any()); // ❌ REMOVE THIS LINE - it causes issues

// // --------------------
// // Routes
// // --------------------
// app.use("/api/auth", authRoutes);
// app.use("/api/items", itemRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/branches", branchRoutes);
// app.use("/api/stock-movements", stockMovementRoutes);
// // Admin Routes
// app.use("/api/admin", adminRoutes);
// io.on("connection", (socket) => {
//   console.log("✅ New client connected:", socket.id);

//   socket.on("join-branch", (branchId) => {
//     if (branchId) {
//       socket.join(branchId);
//       console.log(`🔔 Socket ${socket.id} joined branch ${branchId}`);
//     }
//   });

//   socket.on("disconnect", () => console.log("❌ Client disconnected:", socket.id));
// });

// // --------------------
// // Cron job for low stock checks (every hour)
// // --------------------
// cron.schedule("0 * * * *", async () => {
//   console.log("Running low stock check...");
//   try {
//     await checkLowStock(io)(); // pass io to avoid circular import
//   } catch (err) {
//     console.error("Low stock check failed:", err.message);
//   }
// });

// // --------------------
// // Serve frontend in production
// // --------------------
// if (process.env.NODE_ENV === "production") {
//   const __dirname = path.resolve();
//   app.use(express.static(path.join(__dirname, "../Frontend/dist")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
//   });
// }

// // --------------------
// // Error handling
// // --------------------
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err.stack);
//   res.status(err.status || 500).json({
//     error: err.message || "Internal Server Error",
//     details: process.env.NODE_ENV === "development" ? err.stack : undefined,
//   });
// });

// // --------------------
// // Start server
// // --------------------
// console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "✅ Yes" : "❌ No");

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
//   swaggerDocs(app);
// });


import dotenv from "dotenv";
import path from "path";
import { app, server, io } from "./utils/socket.js";
import express from "express";
import cors from "cors";
import cron from "node-cron";

import connectDB from "./config/db.js";
import swaggerDocs from "./swagger.js";
import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import checkLowStock from "./utils/checkLowStock.js";
import branchRoutes from "./routes/branchRoutes.js";
import adminRoutes from "./routes/AdminRoute.js";
import stockMovementRoutes from "./routes/StockMovementRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js"; // ✅ NEW - Super Admin Routes

dotenv.config();

// --------------------
// Database
// --------------------
connectDB().catch((err) => {
  console.error("Database connection failed:", err);
  process.exit(1);
});

// --------------------
// CORS setup
// --------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  process.env.FRONTEND_URL,
  "https://inventory-sycr.onrender.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman/cURL
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.error("❌ Blocked by CORS:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-branch-id"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// Static Files (for uploads)
// --------------------
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDir));

// --------------------
// Routes
// --------------------
app.use("/api/auth", authRoutes);                      // ✅ Tenant authentication & user management
app.use("/api/super-admin", superAdminRoutes);         // ✅ NEW - Super Admin routes
app.use("/api/items", itemRoutes);                     // ✅ Item management
app.use("/api/notifications", notificationRoutes);     // ✅ Notifications
app.use("/api/branches", branchRoutes);                // ✅ Branch management
app.use("/api/stock-movements", stockMovementRoutes);  // ✅ Stock movements
app.use("/api/admin", adminRoutes);                    // ✅ Tenant admin dashboard

// --------------------
// Health Check Endpoint
// --------------------
app.get("/", (req, res) => {
  res.json({
    message: "Multi-Tenant Inventory Management System API",
    version: "2.0.0",
    status: "running",
    endpoints: {
      auth: "/api/auth",
      superAdmin: "/api/super-admin",          // ✅ NEW
      items: "/api/items",
      branches: "/api/branches",
      admin: "/api/admin",
      notifications: "/api/notifications",
      stockMovements: "/api/stock-movements",
    },
  });
});

// --------------------
// Socket.IO for real-time notifications
// --------------------
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("join-branch", (branchId) => {
    if (branchId) {
      socket.join(branchId);
      console.log(`🔔 Socket ${socket.id} joined branch ${branchId}`);
    }
  });

  socket.on("disconnect", () => console.log("❌ Client disconnected:", socket.id));
});

// --------------------
// Cron job for low stock checks (every hour)
// --------------------
cron.schedule("0 * * * *", async () => {
  console.log("🔄 Running low stock check...");
  try {
    await checkLowStock(io)();
  } catch (err) {
    console.error("❌ Low stock check failed:", err.message);
  }
});

// --------------------
// Serve frontend in production
// --------------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
  });
}

// --------------------
// 404 Handler
// --------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// --------------------
// Global Error Handler
// --------------------
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// --------------------
// Start server
// --------------------
console.log("\n🔍 Environment Check:");
console.log("   JWT_SECRET:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Missing");
console.log("   MONGODB_URI:", process.env.MONGODB_URI ? "✅ Loaded" : "❌ Missing");
console.log("   NODE_ENV:", process.env.NODE_ENV || "development");

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("\n📋 Available endpoints:");
  console.log(`   - Health: GET /`);
  console.log(`   - Tenant Auth: /api/auth`);
  console.log(`   - Super Admin: /api/super-admin`);           // ✅ NEW
  console.log(`   - Items: /api/items`);
  console.log(`   - Branches: /api/branches`);
  console.log(`   - Admin Dashboard: /api/admin`);
  console.log(`   - Notifications: /api/notifications`);
  console.log(`   - Stock Movements: /api/stock-movements\n`);

  swaggerDocs(app);
});

// --------------------
// Graceful Shutdown
// --------------------
process.on("SIGTERM", () => {
  console.log("⚠️  SIGTERM signal received: closing server gracefully");
  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n⚠️  SIGINT signal received: closing server gracefully");
  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
});
