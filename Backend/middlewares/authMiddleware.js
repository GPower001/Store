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

const authenticate = async (req, res, next) => {
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

    /*
      If token already contains everything we need
      (best case – fast path)
    */
    if (decoded?.id && decoded?.role && decoded?.branchId !== undefined) {
      req.user = {
        id: decoded.id,
        role: decoded.role,
        branchId: decoded.branchId,
        name: decoded.name,
      };
      return next();
    }

    /*
      Fallback: fetch user from DB
    */
    const user = await User.findById(decoded.id).select(
      "_id name role branchId"
    );

    if (!user) {
      return res.status(401).json({
        message: "Authentication failed. User not found.",
      });
    }

    req.user = {
      id: user._id,
      name: user.name,
      role: user.role,
      branchId: user.branchId || null, // admins may have null
    };

    next();
  } catch (err) {
    console.error("Authentication Error:", err.message);
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

export { authenticate };
