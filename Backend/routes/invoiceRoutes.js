import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { checkSubscriptionStatus } from "../middlewares/checkSubscriptionLimits.js";
import { exportInvoices, generateInvoice, getInvoice, getInvoices } from "../controllers/invoiceController.js";

const router = express.Router();

router.use(authenticate, checkSubscriptionStatus);
router.get("/export", exportInvoices);
router.get("/", getInvoices);
router.post("/:id/generate", generateInvoice);
router.get("/:id", getInvoice);

export default router;
