// import rateLimit from "express-rate-limit";
// import RedisStore from "rate-limit-redis";
// import Redis from "ioredis";

// const redisClient = new Redis({
//   host: process.env.REDIS_HOST || 'localhost',
//   port: process.env.REDIS_PORT || 6379,
//   password: process.env.REDIS_PASSWORD || undefined,
//   enableOfflineQueue: false
// });

// export const generalLimiterRedis = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   store: new RedisStore({
//     client: redisClient,
//     prefix: 'rl:general:'
//   }),
//   message: {
//     success: false,
//     message: "Too many requests, please try again later"
//   }
// });

// export const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // Limit each IP to 10 requests per windowMs
//   store: new RedisStore({
//     client: redisClient,
//     prefix: 'rl:auth:'
//   }),
//   message: {
//     success: false,
//     message: "Too many authentication requests, please try again later"
//   },
//   skipSuccessfulRequests: false // Count all requests
// });

// export const registrationLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 3, // 3 registrations per hour
//   store: new RedisStore({
//     client: redisClient,
//     prefix: 'rl:register:'
//   }),
//   message: {
//     success: false,
//     message: "Too many registration attempts, please try again after an hour"
//   }
// });

// export const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   store: new RedisStore({
//     client: redisClient,
//     prefix: 'rl:api:'
//   }),
//   message: {
//     success: false,
//     message: "Too many API requests, please try again later"
//   }
// });

// import rateLimit from "express-rate-limit";

// let store = null;
// let storeType = 'memory';

// // Function to initialize the store
// async function initializeStore() {
//   try {
//     // Dynamic imports to avoid import errors if packages aren't installed
//     const { default: Redis } = await import("ioredis");
//     const { default: RedisStore } = await import("rate-limit-redis");
    
//     console.log("🔄 Testing Redis connection...");
    
//     const redisClient = new Redis({
//       host: process.env.REDIS_HOST || 'localhost',
//       port: process.env.REDIS_PORT || 6379,
//       password: process.env.REDIS_PASSWORD || undefined,
//       enableOfflineQueue: false, // Important: don't queue commands
//       connectTimeout: 2000, // 2 second timeout
//       maxRetriesPerRequest: 0, // Don't retry
//       retryStrategy: null, // Disable retry strategy
//       lazyConnect: false // Connect immediately to test
//     });
    
//     // Try to connect and ping
//     await redisClient.ping();
    
//     console.log("✅ Redis connected successfully");
//     storeType = 'redis';
    
//     return new RedisStore({
//       sendCommand: (...args) => redisClient.call(...args),
//     });
    
//   } catch (error) {
//     console.log("⚠️ Redis not available:", error.message);
//     console.log("🔄 Using memory store instead");
//     storeType = 'memory';
    
//     // Memory store is built-in to express-rate-limit, no need for separate import
//     // Just return undefined to use default memory store
//     return undefined;
//   }
// }

// // Initialize store
// store = await initializeStore();

// // Factory function to create limiters
// const createLimiter = (options) => {
//   const limiterOptions = {
//     windowMs: options.windowMs,
//     max: options.max,
//     message: {
//       success: false,
//       message: options.message
//     },
//     skipSuccessfulRequests: options.skipSuccessful || false,
//     standardHeaders: true,
//     legacyHeaders: false,
//   };
  
//   // Only add store if we have a Redis store
//   if (store) {
//     limiterOptions.store = store;
//   }
//   // If store is undefined, express-rate-limit will use its default memory store
  
//   return rateLimit(limiterOptions);
// };

// // Export all limiters
// export const apiLimiter = createLimiter({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many API requests, please try again later"
// });

// export const generalLimiterRedis = createLimiter({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests, please try again later"
// });

// export const authLimiter = createLimiter({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   message: "Too many login attempts, please try again after 15 minutes",
//   skipSuccessful: true
// });

// export const registrationLimiter = createLimiter({
//   windowMs: 60 * 60 * 1000,
//   max: 3,
//   message: "Too many registration attempts, please try again after an hour"
// });

// export const passwordResetLimiter = createLimiter({
//   windowMs: 60 * 60 * 1000,
//   max: 3,
//   message: "Too many password reset attempts, please try again after an hour"
// });

// console.log(`📊 Rate limiting active (${storeType} store)`);
import rateLimit from "express-rate-limit";

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiterRedis = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts from this IP, please try again after 15 minutes"
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for tenant registration
 * 3 registrations per hour per IP
 */
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: "Too many accounts created from this IP, please try again after an hour"
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for password reset
 * 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: "Too many password reset attempts, please try again after an hour"
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for file uploads
 * 10 uploads per hour per user
 * Falls back to IP if user not authenticated
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: "Too many file uploads, please try again after an hour"
  },
  keyGenerator: (req, res) => {
    // Only use user ID, don't include IP in the key
    if (req.user?.id) {
      return `user-upload-${req.user.id}`;
    }
    // Return undefined to use default IP-based key generation
    return undefined;
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for expensive operations (reports, exports)
 * 10 requests per hour per user
 * Falls back to IP if user not authenticated
 */
export const expensiveOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: "Too many report/export requests, please try again after an hour"
  },
  keyGenerator: (req, res) => {
    // Only use user ID, don't include IP in the key
    if (req.user?.id) {
      return `user-export-${req.user.id}`;
    }
    // Return undefined to use default IP-based key generation
    return undefined;
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for API calls per tenant
 * 1000 requests per hour per tenant
 * Falls back to IP if tenant not available
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: {
    success: false,
    message: "API rate limit exceeded, please try again later"
  },
  keyGenerator: (req, res) => {
    // Only use tenant ID, don't include IP in the key
    if (req.user?.tenantId) {
      return `tenant-api-${req.user.tenantId.toString()}`;
    }
    // Return undefined to use default IP-based key generation
    return undefined;
  },
  standardHeaders: true,
  legacyHeaders: false
});