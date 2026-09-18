import express from "express";
import {
  getAdminOverview,
  getBranchSummary,
  getBranchDetails,
  getCategoryDistribution,
  getUserStats,
  getAllUsers,
  getStockTrend,
  // ✅ ADD THESE NEW IMPORTS
  getActivityFeed,
  getUserActivity,
  getActivityStats,
  getItemActivity
} from "../controllers/AdminController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminOnly.js";

const router = express.Router();

// ✅ All admin routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);


/**
 * @route GET /api/admin/overview
 * @desc Get admin overview of all branches
 */
router.get("/overview", getAdminOverview);

/**
 * @route GET /api/admin/branch-summary
 * @desc Get branch comparison/summary
 */
router.get("/branch-summary", getBranchSummary);

/**
 * @route GET /api/admin/branch/:branchId
 * @desc Get detailed information for a specific branch
 */
router.get("/branch/:branchId", getBranchDetails);

/**
 * @route GET /api/admin/category-distribution
 * @desc Get category-wise distribution across all branches
 */
router.get("/category-distribution", getCategoryDistribution);

/**
 * @route GET /api/admin/users
 * @desc Get user statistics
 */
router.get("/users", getUserStats);

/**
 * @route GET /api/admin/all-users
 * @desc Get all users with details
 */
router.get("/all-users", getAllUsers);

/**
 * @route GET /api/admin/stock-trend
 * @desc Get stock movement trend
 */
router.get("/stock-trend", getStockTrend);

/**
 * @route GET /api/admin/activity-feed
 * @desc Get recent activity feed (real-time view of all activities)
 */
router.get("/activity-feed", getActivityFeed);

/**
 * @route GET /api/admin/users/:userId/activity
 * @desc Get detailed activity for a specific user
 */
router.get("/users/:userId/activity", getUserActivity);

/**
 * @route GET /api/admin/activity-stats
 * @desc Get overall activity statistics
 */
router.get("/activity-stats", getActivityStats);

/**
 * @route GET /api/admin/items/:itemId/activity
 * @desc Get complete history for a specific item
 */
router.get("/items/:itemId/activity", getItemActivity);

export default router;