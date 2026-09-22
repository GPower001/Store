import cors from "cors";

/**
 * Enhanced CORS configuration
 */
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === "production") return [process.env.FRONTEND_URL_PROD].filter(Boolean);
  return [
    process.env.FRONTEND_URL_DEV,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
  ].filter(Boolean);
};

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (getAllowedOrigins().includes(origin)) {
      return callback(null, true);
    }
    
    console.error("❌ Blocked by CORS:", origin);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-branch-id",
    "X-CSRF-Token"
  ],
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset"
  ],
  maxAge: 86400 // 24 hours
};

export const corsMiddleware = cors(corsOptions);