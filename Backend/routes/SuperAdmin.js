import express from "express";
import {
  loginSuperAdmin,
  getAllTenants,
  getTenantDetails,
  updateTenant,
  changeTenantStatus,
  deleteTenant,
  getSystemStatistics,
  getSuperAdminProfile,
  createSuperAdmin,
} from "../controllers/superAdminController.js";
import { 
  authenticateSuperAdmin,
  checkPermission 
} from "../middlewares/superAdminMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * @route POST /api/super-admin/login
 * @desc Super admin login
 * @access Public
 */
router.post("/login", loginSuperAdmin);

// ==========================================
// PROTECTED ROUTES (Super Admin Only)
// ==========================================

// Apply super admin authentication to all routes below
router.use(authenticateSuperAdmin);

/**
 * @route GET /api/super-admin/me
 * @desc Get super admin profile
 * @access Private/SuperAdmin
 */
router.get("/me", getSuperAdminProfile);

/**
 * @route POST /api/super-admin/create
 * @desc Create new super admin
 * @access Private/SuperAdmin
 */
router.post("/create", createSuperAdmin);

// ==========================================
// TENANT MANAGEMENT
// ==========================================

/**
 * @route GET /api/super-admin/tenants
 * @desc Get all tenants with statistics
 * @access Private/SuperAdmin
 */
router.get("/tenants", checkPermission("canManageTenants"), getAllTenants);

/**
 * @route GET /api/super-admin/tenants/:id
 * @desc Get single tenant details
 * @access Private/SuperAdmin
 */
router.get("/tenants/:id", checkPermission("canManageTenants"), getTenantDetails);

/**
 * @route PUT /api/super-admin/tenants/:id
 * @desc Update tenant
 * @access Private/SuperAdmin
 */
router.put("/tenants/:id", checkPermission("canManageSubscriptions"), updateTenant);

/**
 * @route PATCH /api/super-admin/tenants/:id/status
 * @desc Change tenant status
 * @access Private/SuperAdmin
 */
router.patch(
  "/tenants/:id/status",
  checkPermission("canSuspendTenants"),
  changeTenantStatus
);

/**
 * @route DELETE /api/super-admin/tenants/:id
 * @desc Delete tenant permanently
 * @access Private/SuperAdmin
 */
router.delete(
  "/tenants/:id",
  checkPermission("canManageTenants"),
  deleteTenant
);

// ==========================================
// SYSTEM ANALYTICS
// ==========================================

/**
 * @route GET /api/super-admin/statistics
 * @desc Get system-wide statistics
 * @access Private/SuperAdmin
 */
router.get("/statistics", checkPermission("canViewAnalytics"), getSystemStatistics);

export default router;