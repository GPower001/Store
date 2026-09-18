import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { checkSubscriptionStatus } from "../middlewares/checkSubscriptionLimits.js";
import { createSale, getRecentSales, scanProduct } from "../controllers/posController.js";

const router = express.Router();

router.use(authenticate, checkSubscriptionStatus);
router.get("/scan/:code", scanProduct);
router.get("/recent", getRecentSales);
router.post("/sales", createSale);

export default router;
