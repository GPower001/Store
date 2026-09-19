import dotenv from "dotenv";
import path from "path";
import { app, server, io } from "./utils/socket.js";
import express from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";

// ✅ SECURITY IMPORTS
import { 
  generalLimiterRedis, 
  apiLimiter,
  notificationLimiter
} from "./middlewares/rateLimiter.js";
import { 
  securityHeaders, 
  customSecurityHeaders 
} from "./middlewares/securityHeaders.js";
import { 
  sanitizeMongo, 
  sanitizeXSS, 
  sanitizeInput 
} from "./middlewares/sanitizer.js";
import { checkIPBlocklist } from "./utils/ipBlocklist.js";
import { corsMiddleware } from "./middlewares/corsConfig.js";

// Database & Routes
import connectDB from "./config/db.js";
import swaggerDocs from "./swagger.js";
import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import checkLowStock from "./utils/checkLowStock.js";
import branchRoutes from "./routes/branchRoutes.js";
import adminRoutes from "./routes/AdminRoute.js";
import stockMovementRoutes from "./routes/StockMovementRoutes.js";
import superAdminRoutes from "./routes/superAdmin.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";

// Audit Route
import auditRoutes from "./routes/auditRoutes.js";
import reportRoutes from "./routes/reportRoutes.js"
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js"
import posRoutes from "./routes/posRoutes.js"
import invoiceRoutes from "./routes/invoiceRoutes.js";

dotenv.config();

// --------------------
// Database Connection
// --------------------
connectDB().catch((err) => {
  console.error("❌ Database connection failed:", err);
  process.exit(1);
});

// --------------------
// SECURITY MIDDLEWARE (Applied BEFORE routes)
// --------------------

// 1. IP Blocklist Check (First line of defense)
app.use(checkIPBlocklist);

// 2. Security Headers (Helmet)
app.use(securityHeaders);
app.use(customSecurityHeaders);

// 3. CORS Configuration
app.use(corsMiddleware);

// 4. Body Parsing
app.use(express.json({ limit: '10mb', verify: (req, res, buffer) => { req.rawBody = buffer; } })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // Required for CSRF tokens

// 5. Sanitization (Prevent injection attacks)
app.use(sanitizeMongo); // Prevent NoSQL injection
app.use(sanitizeXSS);   // Prevent XSS attacks
app.use(sanitizeInput); // Custom input sanitization

// 6. Global Rate Limiting
app.use('/api/', generalLimiterRedis); // Apply to all API routes

// --------------------
// Static Files
// --------------------
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDir));

// --------------------
// Routes (WITH SPECIFIC RATE LIMITERS)
// --------------------

// Auth routes have stricter rate limiting (applied in authRoutes.js)
app.use("/api/auth", authRoutes);

// Super Admin routes
app.use("/api/super-admin", superAdminRoutes);

// Subscription routes
app.use("/api/subscription", subscriptionRoutes);

// API routes with standard rate limiting
app.use("/api/items", apiLimiter, itemRoutes);
app.use("/api/notifications", notificationLimiter, notificationRoutes);
app.use("/api/branches", apiLimiter, branchRoutes);
app.use("/api/stock-movements", apiLimiter, stockMovementRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);

// Audit Route
app.use("/api/audit", auditRoutes);
app.use("/api/reports", reportRoutes)
app.use("/api/PurchaseOrder", purchaseOrderRoutes)
app.use("/api/pos", apiLimiter, posRoutes)
app.use("/api/invoices", apiLimiter, invoiceRoutes)
// --------------------
// Health Check Endpoint
// --------------------
app.get("/", (req, res) => {
  res.json({
    message: "Multi-Tenant Inventory Management System API",
    version: "2.0.0",
    status: "running",
    security: {
      rateLimiting: "enabled",
      headers: "secured",
      sanitization: "enabled",
      cors: "configured"
    },
    endpoints: {
      auth: "/api/auth",
      superAdmin: "/api/super-admin",
      subscription: "/api/subscription",
      items: "/api/items",
      branches: "/api/branches",
      admin: "/api/admin",
      notifications: "/api/notifications",
      stockMovements: "/api/stock-movements",
    },
  });
});



// --------------------
// Socket.IO
// --------------------
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("join-branch", (branchId) => {
    if (branchId) {
      socket.join(branchId);
      console.log(`🔒 Socket ${socket.id} joined branch ${branchId}`);
    }
  });

  socket.on("disconnect", () => console.log("❌ Client disconnected:", socket.id));
});

// --------------------
// Cron Jobs
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
// Production: Serve Frontend
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
// Global Error Handler (WITH SECURITY)
// --------------------
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.stack);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation"
    });
  }

  // CSRF errors
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token"
    });
  }

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

  // Payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: "Request payload too large"
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : "Internal Server Error",
    ...(isDevelopment && { stack: err.stack })
  });
});

// --------------------
// Start Server
// --------------------
console.log("\nEnvironment Check:");
console.log("   JWT_SECRET:", process.env.JWT_SECRET ? "Loaded" : "Missing");
console.log("   MONGODB_URI:", process.env.MONGO_URI ? "Loaded" : "Missing");
console.log("   NODE_ENV:", process.env.NODE_ENV || "development");

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\nServer running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("\nSecurity Features Enabled:");
  console.log("Rate Limiting");
  console.log("Security Headers (Helmet)");
  console.log("XSS Protection");
  console.log("NoSQL Injection Protection");
  console.log("CORS Configuration");
  console.log("IP Blocklist");
  console.log("\n Available endpoints:");
  console.log(`   - Health: GET /`);
  console.log(`   - Tenant Auth: /api/auth`);
  console.log(`   - Super Admin: /api/super-admin`);
  console.log(`   - Subscription: /api/subscription`);
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
  console.log(" SIGTERM signal received: closing server gracefully");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n SIGINT signal received: closing server gracefully");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});