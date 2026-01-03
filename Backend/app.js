// import express from "express";
// import path from "path";
// import { fileURLToPath } from "url";

// const app = express();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // **Core Middleware**
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // **Static Files**
// const uploadsDir = path.join(__dirname, 'uploads');
// app.use("/uploads", express.static(uploadsDir));

// // **Routes (to be mounted later)**


// // **Error Handler**
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: err.message || "Internal Server Error" });
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

// **Routes will be mounted in server.js**

// **Error Handler**
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

export default app;