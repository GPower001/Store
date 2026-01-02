import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminOnly.js";
import * as stockMovementController from "../controllers/StockMovementControllers.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.use(adminOnly);

// Record a stock movement
router.post("/", stockMovementController.recordStockMovement);

// Get stock movements with filters
router.get("/", stockMovementController.getStockMovements);

// Admin-only routes
router.get("/stats", adminOnly, stockMovementController.getStockMovementStats);
router.get("/by-user", adminOnly, stockMovementController.getMovementsByUser);

export default router;