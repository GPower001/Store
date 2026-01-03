// import express from "express";
// import { register, login, getAllUsers, updateUser, deleteUser } from "../controllers/authController.js";
// import { authenticate } from "../middlewares/authMiddleware.js";
// import adminOnly from "../middlewares/adminOnly.js";

// const router = express.Router();

// // Public routes
// router.post("/register", register);
// router.post("/login", login);

// // Admin-only user management routes
// router.get("/users", authenticate, adminOnly, getAllUsers);
// router.put("/users/:id", authenticate, adminOnly, updateUser);
// router.delete("/users/:id", authenticate, adminOnly, deleteUser);

// export default router;


import express from "express";
import { 
  registerNewTenant, 
  register, 
  login, 
  getAllUsers, 
  updateUser, 
  deleteUser,
  getMe
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminOnly.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (No authentication needed)
// ==========================================

/**
 * @route POST /api/auth/register-tenant
 * @desc Register new tenant (SME company signup)
 * @access Public
 */
router.post("/register-tenant", registerNewTenant);

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post("/login", login);

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get("/me", authenticate, getMe);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

/**
 * @route POST /api/auth/register
 * @desc Register new user within tenant (Admin only)
 * @access Private/Admin
 */
router.post("/register", authenticate, adminOnly, register);

/**
 * @route GET /api/auth/users
 * @desc Get all users in tenant
 * @access Private/Admin
 */
router.get("/users", authenticate, adminOnly, getAllUsers);

/**
 * @route PUT /api/auth/users/:id
 * @desc Update user
 * @access Private/Admin
 */
router.put("/users/:id", authenticate, adminOnly, updateUser);

/**
 * @route DELETE /api/auth/users/:id
 * @desc Delete user
 * @access Private/Admin
 */
router.delete("/users/:id", authenticate, adminOnly, deleteUser);

export default router;