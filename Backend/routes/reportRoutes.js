import express from "express";
import {
  getInventoryValuation,
  getStockTrends,
  getTopItems,
  getCategoryAnalysis,
  getBranchComparison,
  exportReport
} from "../controllers/reportController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { expensiveOperationLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// All report routes require authentication
router.use(authenticate);

// Apply rate limiting to report endpoints
router.use(expensiveOperationLimiter);

/**
 * @route GET /api/reports/inventory-valuation
 * @desc Get inventory valuation report
 */
router.get("/inventory-valuation", getInventoryValuation);

/**
 * @route GET /api/reports/stock-trends
 * @desc Get stock trends and alerts
 */
router.get("/stock-trends", getStockTrends);

/**
 * @route GET /api/reports/top-items
 * @desc Get top performing items
 */
router.get("/top-items", getTopItems);

/**
 * @route GET /api/reports/category-analysis
 * @desc Get category analysis
 */
router.get("/category-analysis", getCategoryAnalysis);

/**
 * @route GET /api/reports/branch-comparison
 * @desc Get branch comparison report
 */
router.get("/branch-comparison", getBranchComparison);

/**
 * @route GET /api/reports/export
 * @desc Export report data
 */
router.get("/export", exportReport);

export default router;
