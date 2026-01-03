import jwt from "jsonwebtoken";
import SuperAdmin from "../models/SuperAdmin.js";

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fast path: token contains super admin info
    if (decoded?.id && decoded?.role === "SuperAdmin") {
      req.superAdmin = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      };
      return next();
    }

    // Fallback: fetch super admin from DB
    const superAdmin = await SuperAdmin.findById(decoded.id).select(
      "_id name email role isActive permissions"
    );

    if (!superAdmin) {
      return res.status(401).json({
        message: "Authentication failed. Super admin not found.",
      });
    }

    if (!superAdmin.isActive) {
      return res.status(401).json({
        message: "Account is inactive. Please contact support.",
      });
    }

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
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

/**
 * Check specific super admin permission
 */
export const checkPermission = (permissionName) => {
  return (req, res, next) => {
    if (!req.superAdmin) {
      return res.status(403).json({
        message: "Super admin access required.",
      });
    }

    if (!req.superAdmin.permissions?.[permissionName]) {
      return res.status(403).json({
        message: `Permission denied: ${permissionName}`,
      });
    }

    next();
  };
};

export default authenticateSuperAdmin;