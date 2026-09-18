// import jwt from "jsonwebtoken";
// import SuperAdmin from "../models/SuperAdmin.js";

// /**
//  * Middleware to authenticate super admin
//  */
// export const authenticateSuperAdmin = async (req, res, next) => {
//   let token = req.header("Authorization");

//   if (!token) {
//     return res.status(401).json({
//       message: "Access denied. No token provided.",
//     });
//   }

//   // Handle: Bearer <token>
//   if (token.startsWith("Bearer ")) {
//     token = token.slice(7).trim();
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Fast path: token contains super admin info
//     if (decoded?.id && decoded?.role === "SuperAdmin") {
//       req.superAdmin = {
//         id: decoded.id,
//         name: decoded.name,
//         email: decoded.email,
//         role: decoded.role,
//       };
//       return next();
//     }

//     // Fallback: fetch super admin from DB
//     const superAdmin = await SuperAdmin.findById(decoded.id).select(
//       "_id name email role isActive permissions"
//     );

//     if (!superAdmin) {
//       return res.status(401).json({
//         message: "Authentication failed. Super admin not found.",
//       });
//     }

//     if (!superAdmin.isActive) {
//       return res.status(401).json({
//         message: "Account is inactive. Please contact support.",
//       });
//     }

//     req.superAdmin = {
//       id: superAdmin._id,
//       name: superAdmin.name,
//       email: superAdmin.email,
//       role: superAdmin.role,
//       permissions: superAdmin.permissions,
//     };

//     next();
//   } catch (err) {
//     console.error("Super Admin Authentication Error:", err.message);
//     return res.status(401).json({
//       message: "Invalid or expired token.",
//     });
//   }
// };

// /**
//  * Check specific super admin permission
//  */
// export const checkPermission = (permissionName) => {
//   return (req, res, next) => {
//     if (!req.superAdmin) {
//       return res.status(403).json({
//         message: "Super admin access required.",
//       });
//     }

//     if (!req.superAdmin.permissions?.[permissionName]) {
//       return res.status(403).json({
//         message: `Permission denied: ${permissionName}`,
//       });
//     }

//     next();
//   };
// };

// export default authenticateSuperAdmin;

import jwt from "jsonwebtoken";
import SuperAdmin from "../models/SuperAdmin.js";
import TokenBlacklist from "../models/TokenBlacklist.js";  // ✅ Add this import

/**
 * Middleware to authenticate super admin
 */
export const authenticateSuperAdmin = async (req, res, next) => {
  let token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  // Handle: Bearer <token>
  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  try {
    // ✅ STEP 1: Check if token is blacklisted (logged out)
    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        message: "Token has been revoked. Please login again.",
      });
    }

    // ✅ STEP 2: Verify JWT signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ STEP 3: Verify role is SuperAdmin
    if (decoded?.role !== "SuperAdmin") {
      return res.status(403).json({
        message: "Access denied. Super admin privileges required.",
      });
    }

    // ✅ STEP 4: Fast path - token contains super admin info
    if (decoded?.id && decoded?.role === "SuperAdmin") {
      req.superAdmin = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      };
      return next();
    }

    // ✅ STEP 5: Fallback - fetch super admin from DB
    const superAdmin = await SuperAdmin.findById(decoded.id).select(
      "_id name email role isActive permissions"
    );

    if (!superAdmin) {
      return res.status(401).json({
        message: "Authentication failed. Super admin not found.",
      });
    }

    // ✅ STEP 6: Check if account is active
    if (!superAdmin.isActive) {
      return res.status(401).json({
        message: "Account is inactive. Please contact support.",
      });
    }

    // ✅ STEP 7: Check if account is locked
    if (superAdmin.isLocked && superAdmin.isLocked()) {
      const lockTimeRemaining = Math.ceil((superAdmin.lockUntil - Date.now()) / 1000 / 60);
      return res.status(423).json({
        message: `Account is temporarily locked due to too many failed login attempts. Try again in ${lockTimeRemaining} minutes.`,
      });
    }

    // ✅ STEP 8: Set super admin info on request object
    req.superAdmin = {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role,
      permissions: superAdmin.permissions,
    };

    next();
  } catch (err) {
    console.error("Super Admin Authentication Error:", err.message);
    
    // ✅ Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired. Please login again.",
      });
    }
    
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token. Please login again.",
      });
    }

    return res.status(401).json({
      message: "Authentication failed.",
    });
  }
};

/**
 * Middleware to check specific super admin permission
 */
export const checkPermission = (permissionName) => {
  return (req, res, next) => {
    // ✅ Ensure super admin is authenticated
    if (!req.superAdmin) {
      return res.status(403).json({
        message: "Super admin access required.",
      });
    }

    // ✅ Check if super admin has the required permission
    if (!req.superAdmin.permissions?.[permissionName]) {
      return res.status(403).json({
        message: `Permission denied: ${permissionName}. Contact system administrator for access.`,
      });
    }

    next();
  };
};

/**
 * Middleware to check multiple permissions (user must have ALL)
 */
export const checkPermissions = (...permissionNames) => {
  return (req, res, next) => {
    if (!req.superAdmin) {
      return res.status(403).json({
        message: "Super admin access required.",
      });
    }

    // ✅ Check if super admin has all required permissions
    const missingPermissions = permissionNames.filter(
      permission => !req.superAdmin.permissions?.[permission]
    );

    if (missingPermissions.length > 0) {
      return res.status(403).json({
        message: `Permission denied: ${missingPermissions.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if super admin has ANY of the specified permissions
 */
export const checkAnyPermission = (...permissionNames) => {
  return (req, res, next) => {
    if (!req.superAdmin) {
      return res.status(403).json({
        message: "Super admin access required.",
      });
    }

    // ✅ Check if super admin has at least one of the permissions
    const hasAnyPermission = permissionNames.some(
      permission => req.superAdmin.permissions?.[permission]
    );

    if (!hasAnyPermission) {
      return res.status(403).json({
        message: `Permission denied. Requires one of: ${permissionNames.join(", ")}`,
      });
    }

    next();
  };
};

export default authenticateSuperAdmin;