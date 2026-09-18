import express from "express";
import {
  getAuditLogs,
  getAuditStats,
  getUserAuditTrail,
  searchAuditLogs
} from "../controllers/auditController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminOnly.js";

const router = express.Router();

// All audit routes require admin access
router.use(authenticate);
router.use(adminOnly);

/**
 * @route GET /api/audit/logs
 * @desc Get audit logs with filters
 */
router.get("/logs", getAuditLogs);

/**
 * @route GET /api/audit/stats
 * @desc Get audit statistics
 */
router.get("/stats", getAuditStats);

/**
 * @route GET /api/audit/users/:userId
 * @desc Get specific user's audit trail
 */
router.get("/users/:userId", getUserAuditTrail);

/**
 * @route GET /api/audit/search
 * @desc Search audit logs
 */
router.get("/search", searchAuditLogs);

export default router;