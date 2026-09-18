// import jwt from "jsonwebtoken";

// const authenticate = (req, res, next) => {
//   const token = req.header("Authorization");
//   if (!token) return res.status(401).json({ error: "Access denied" });

//   try {
//     const verified = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = verified;
//     next();
//   } catch (error) {
//     res.status(400).json({ error: "Invalid token" });
//   }
// };

// export { authenticate };

// import jwt from "jsonwebtoken";
// import User from "../models/userModel.js";

// const authenticate = async (req, res, next) => {
//   let token = req.header("Authorization");

//   if (!token) {
//     return res.status(401).json({ error: "Access denied. No token provided." });
//   }

//   // Handle "Bearer <token>"
//   if (token.startsWith("Bearer ")) {
//     token = token.slice(7).trim();
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // ✅ Option A: Trust token if it has branchId
//     if (decoded.branchId) {
//       req.user = decoded;
//       return next();
//     }

//     // ✅ Option B: Fallback to DB lookup if token missing branchId
//     const user = await User.findById(decoded.id).select("name role branchId");
//     if (!user) {
//       return res.status(401).json({ error: "User not found" });
//     }
//       console.log("Decoded token:", decoded);

//     req.user = {
//       id: user._id,
//       name: user.name,
//       role: user.role,
//       branchId: user.branchId,
//     };

//     next();
//   } catch (err) {
//     console.error("Auth error:", err);
//     res.status(400).json({ error: "Invalid token" });
//   }


// };

// export { authenticate };


import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import TokenBlacklist from "../models/TokenBlacklist.js";  // ✅ Add this import
import Tenant from "../models/Tenant.js";

export const authenticate = async (req, res, next) => {
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

    // Revalidate the account and tenant on every request so stale JWT claims
    // cannot preserve access after an account or organization change.
    const user = await User.findById(decoded.id).select(
      "_id name email role branchId tenantId isActive"
    );

    if (!user) {
      return res.status(401).json({
        message: "Authentication failed. User not found.",
      });
    }

    // ✅ STEP 5: Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        message: "Account is inactive. Please contact your administrator.",
      });
    }

    const tenant = await Tenant.findById(user.tenantId).select("status");
    if (!tenant || !["active", "trial"].includes(tenant.status)) {
      return res.status(403).json({
        message: "Organization is not active.",
      });
    }

    // ✅ STEP 6: Verify tenant exists (multi-tenant security)
    if (!user.tenantId) {
      return res.status(403).json({
        message: "User is not associated with any organization.",
      });
    }

    // ✅ STEP 7: Set user info on request object
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,  // ✅ Always include tenant
      branchId: user.branchId || null,
    };

    next();
  } catch (err) {
    console.error("Authentication Error:", err.message);
    
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