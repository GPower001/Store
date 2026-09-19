
import express from "express";
import {
  getSubscriptionPlans,
  getSubscriptionStatus,
  upgradeSubscription,
  cancelSubscription,
  checkLimits,
  handlePaymentWebhook,
  initializeSubscriptionPayment,
  verifySubscriptionPayment,
  addStaffSlots,
  removeStaffSlots
} from "../controllers/subscriptionController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminOnly.js";

const router = express.Router();

/**
 * PUBLIC ROUTES (no authentication needed)
 */

// Get all available subscription plans
// Example: GET /api/subscription/plans
router.get("/plans", getSubscriptionPlans);

// Webhook for payment provider (Paystack, Stripe, etc.)
// Example: POST /api/subscription/webhook
router.post("/webhook", handlePaymentWebhook);

/**
 * PROTECTED ROUTES (authentication required)
 */

// Get current subscription status and usage
// Example: GET /api/subscription/status
router.get("/status", authenticate, getSubscriptionStatus);

// Check if limits are reached
// Example: GET /api/subscription/check-limits
router.get("/check-limits", authenticate, checkLimits);
router.post("/add-staff-slots", authenticate, adminOnly, addStaffSlots);
router.post("/remove-staff-slots", authenticate, adminOnly, removeStaffSlots);
router.post("/initialize", authenticate, adminOnly, initializeSubscriptionPayment);
router.get("/verify/:reference", authenticate, adminOnly, verifySubscriptionPayment);

/**
 * ADMIN ONLY ROUTES
 */

// Upgrade subscription to higher tier
// Example: POST /api/subscription/upgrade
// Body: { newTier: "basic", paymentMethodId: "pm_xxx" }
router.post("/upgrade", authenticate, adminOnly, upgradeSubscription);

// Cancel subscription
// Example: POST /api/subscription/cancel
// Body: { reason: "too expensive", feedback: "..." }
router.post("/cancel", authenticate, adminOnly, cancelSubscription);

export default router;