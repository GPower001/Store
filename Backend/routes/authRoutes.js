import express from "express";
import { 
  registerTenant,
  register, 
  login,
  logout, 
  getAllUsers, 
  updateUser, 
  deleteUser,
  getMe,
  updateProfile,
  updateOrganization
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminOnly.js";
import { checkResourceLimit } from "../middlewares/checkSubscriptionLimits.js";
import { disableTwoFactor, enableTwoFactor, getTwoFactorStatus, setupTwoFactor, verifyTwoFactorLogin } from "../controllers/twoFactorController.js";

// SECURITY IMPORTS
import { 
  authLimiter, 
  registrationLimiter 
} from "../middlewares/rateLimiter.js";
import {
  validateLogin,
  validateUserRegistration,
  validateTenantRegistration
} from "../middlewares/validator.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (WITH RATE LIMITING)
// ==========================================

/**
 * @route POST /api/auth/register-tenant
 * @desc Register new tenant (SME company signup)
 * @access Public
 */
router.post(
  "/register-tenant", 
  registrationLimiter,           //3 per hour
  validateTenantRegistration,    //Input validation
  registerTenant
);
router.post("/2fa/verify-login", verifyTwoFactorLogin);
router.get("/2fa/status", authenticate, getTwoFactorStatus);
router.post("/2fa/setup", authenticate, setupTwoFactor);
router.post("/2fa/enable", authenticate, enableTwoFactor);
router.post("/2fa/disable", authenticate, disableTwoFactor);

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post(
  "/login", 
  authLimiter,      // 5 attempts per 15 minutes
  validateLogin,    // Input validation
  login
);

// ==========================================
// PROTECTED ROUTES
// ==========================================

router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateProfile);
router.put("/organization", authenticate, adminOnly, updateOrganization);
router.post("/logout", authenticate, logout);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

router.post(
  "/register", 
  authenticate, 
  adminOnly, 
  validateUserRegistration,      // ✅ Input validation
  checkResourceLimit("users"),
  register
);

router.get("/users", authenticate, adminOnly, getAllUsers);
router.put("/users/:id", authenticate, adminOnly, updateUser);
router.delete("/users/:id", authenticate, adminOnly, deleteUser);

export default router;