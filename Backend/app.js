// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
// import helmet from "helmet";
// import authRoutes from "./routes/authRoutes.js";

// const app = express();

// // Middleware
// app.use(cors());
// app.use(helmet()); // Security headers
// app.use(morgan("dev")); // Logs requests in development mode
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // Support form data

// // Routes
// app.use("/auth", authRoutes);

// // Global Error Handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
// });

// export default app;



// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
// import helmet from "helmet";
// import authRoutes from "./routes/authRoutes.js";
// import itemRoutes from "./routes/itemRoutes.js";

// const app = express();

// // **CORS Middleware (Ensuring It Runs Before Routes)**
// app.use(
//     cors({
//         origin: ["http://localhost:5173", process.env.FRONTEND_URL],
//         credentials: true,
//         methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//     })
// );

// // **Preflight Requests**
// app.options("*", cors());

// // **Security & Logging Middlewares**
// app.use(helmet());
// app.use(morgan("dev"));

// // **Body Parsers**
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // **Routes**
// app.use("/auth", authRoutes);
// app.use("/uploads", express.static("uploads"));
// app.use("/api/items", itemRoutes);

// // **Global Error Handler**
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
// });

// export default app;


// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
// import helmet from "helmet";
// import authRoutes from "./routes/authRoutes.js";
// import itemRoutes from "./routes/itemRoutes.js";
// import path from "path";
// import { fileURLToPath } from "url";

// const app = express();

// // Get __dirname equivalent in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // **CORS Middleware**
// app.use(
//     cors({
//         origin: ["http://localhost:5173", process.env.FRONTEND_URL],
//         credentials: true,
//         methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//     })
// );

// // **Preflight Requests**
// app.options("*", cors());

// // **Security & Logging Middlewares**
// app.use(helmet());
// app.use(morgan("dev"));

// // **Body Parsers**
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // **Static Files (ensure uploads directory exists)**
// const uploadsDir = path.join(__dirname, 'uploads');
// app.use("/uploads", express.static(uploadsDir));

// // // **Routes**
// app.use("/auth", authRoutes);
// app.use("/api/items", itemRoutes);  // Make sure itemRoutes exports a router

// // **Global Error Handler**
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(err.status || 500).json({ 
//         error: err.message || "Internal Server Error" 
//     });
// });

// export default app;

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// **Core Middleware**
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// **Static Files**
const uploadsDir = path.join(__dirname, 'uploads');
app.use("/uploads", express.static(uploadsDir));

// **Routes (to be mounted later)**


// **Error Handler**
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

export default app;