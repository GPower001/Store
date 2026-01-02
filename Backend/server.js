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
// import upload from "./middlewares/uploadMiddleware.js";
// import checkLowStock from "./utils/checkLowStock.js";
// import branchRoutes from "./routes/branchRoutes.js"; 

// dotenv.config();

// // --------------------
// // Database
// // --------------------
// connectDB().catch((err) => {
//   console.error("Database connection failed:", err);
//   process.exit(1);
// });

// // --------------------
// // Express app
// // --------------------


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
// app.use(upload.any());

// // --------------------
// // Routes
// // --------------------
// app.use("/api/auth", authRoutes);
// app.use("/api/items", itemRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/branches", branchRoutes);



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
import express from "express"
import cors from "cors";
import cron from "node-cron";

import connectDB from "./config/db.js";
import swaggerDocs from "./swagger.js";
import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
// import upload from "./middlewares/uploadMiddleware.js"; // ❌ REMOVE THIS
import checkLowStock from "./utils/checkLowStock.js";
import branchRoutes from "./routes/branchRoutes.js"; 
import adminRoutes from "./routes/AdminRoute.js";
import stockMovementRoutes from "./routes/StockMovementRoutes.js";




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
// app.use(upload.any()); // ❌ REMOVE THIS LINE - it causes issues

// --------------------
// Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/stock-movements", stockMovementRoutes);
// Admin Routes
app.use("/api/admin", adminRoutes);
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
  console.log("Running low stock check...");
  try {
    await checkLowStock(io)(); // pass io to avoid circular import
  } catch (err) {
    console.error("Low stock check failed:", err.message);
  }
});

// --------------------
// Serve frontend in production
// --------------------
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
  });
}

// --------------------
// Error handling
// --------------------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// --------------------
// Start server
// --------------------
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "✅ Yes" : "❌ No");

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  swaggerDocs(app);
});







// import dotenv from "dotenv";
// import http from "http";
// import { Server } from "socket.io";
// import express from "express";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import app from "./app.js";
// import swaggerDocs from "./swagger.js";
// import authRoutes from "./routes/authRoutes.js";
// import itemRoutes from "./routes/itemRoutes.js";
// import upload from "./middlewares/uploadMiddleware.js";
// import cron from "node-cron";
// import checkLowStock from "./utils/checkLowStock.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
// import path from "path";
// import { fileURLToPath } from "url";

// // Load environment variables
// dotenv.config();

// // Connect to the database
// connectDB().catch((err) => {
//   console.error("Database connection failed:", err);
//   process.exit(1);
// });

// // Get the current directory (ESM alternative to __dirname)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Schedule the low stock check to run every hour
// cron.schedule("0 * * * *", async () => {
//   console.log("Running low stock check...");
//   await checkLowStock();
// });

// // Create the HTTP server
// const server = http.createServer(app);

// // **CORS Configuration**
// const allowedOrigins = [
//   "http://localhost:5173", // Local development frontend
//   process.env.FRONTEND_URL, // Frontend URL from environment variables
//   "https://inventory-management-3-pd8c.onrender.com", // Deployed frontend URL
// ];

// const corsOptions = {
//   origin: (origin, callback) => {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.error("Blocked by CORS:", origin); // Log blocked origins
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true, // Enable cookies/auth headers if needed
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// };

// app.use(cors(corsOptions)); // Apply CORS globally

// // **Middleware for Parsing Request Body**
// app.use(express.json()); // Parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
// app.use(upload.any()); // Parse multipart/form-data

// // **Routes**
// app.use("/api/auth", authRoutes);
// app.use("/api/items", itemRoutes);
// app.use("/api/items/:category", itemRoutes);
// app.use("/api/items/:id", itemRoutes);
// app.use("/api/items/lowstock", itemRoutes);
// app.use("/api/notifications", notificationRoutes);

// // **Socket.io Setup**
// export const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//     credentials: true,
//   },
// });

// io.on("connection", (socket) => {
//   console.log("New client connected:", socket.id);
//   socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
// });

// // **Global Error Handling**
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err.stack);
//   res.status(err.status || 500).json({
//     error: err.message || "Internal Server Error",
//     details: process.env.NODE_ENV === "development" ? err.stack : undefined,
//   });
// });

// // **Serve Frontend in Production**
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../Frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../Frontend/dist", "index.html"));
//   });
// }

// // **Start Server**
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
//   swaggerDocs(app); // Initialize Swagger after server starts
// });

