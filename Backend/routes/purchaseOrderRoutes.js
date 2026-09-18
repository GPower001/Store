import express from "express";
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrder,
  updatePurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrderStats
} from "../controllers/purchaseOrderController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminOnly.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/purchase-orders/stats
 * @desc Get purchase order statistics
 */
router.get("/stats", getPurchaseOrderStats);

/**
 * @route POST /api/purchase-orders
 * @desc Create new purchase order
 */
router.post("/", createPurchaseOrder);

/**
 * @route GET /api/purchase-orders
 * @desc Get all purchase orders
 */
router.get("/", getPurchaseOrders);

/**
 * @route GET /api/purchase-orders/:id
 * @desc Get single purchase order
 */
router.get("/:id", getPurchaseOrder);

/**
 * @route PUT /api/purchase-orders/:id
 * @desc Update purchase order
 */
router.put("/:id", updatePurchaseOrder);

/**
 * @route PUT /api/purchase-orders/:id/approve
 * @desc Approve purchase order (Admin only)
 */
router.put("/:id/approve", adminOnly, approvePurchaseOrder);

/**
 * @route PUT /api/purchase-orders/:id/receive
 * @desc Receive items from purchase order
 */
router.put("/:id/receive", receivePurchaseOrder);

/**
 * @route PUT /api/purchase-orders/:id/cancel
 * @desc Cancel purchase order (Admin only)
 */
router.put("/:id/cancel", adminOnly, cancelPurchaseOrder);

/**
 * @route DELETE /api/purchase-orders/:id
 * @desc Delete purchase order (Admin only)
 */
router.delete("/:id", adminOnly, deletePurchaseOrder);

export default router;