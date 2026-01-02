// import express from "express";
// import { authMiddleware } from "../middleware/auth.js";
// import { adminOnly } from "../middleware/adminOnly.js";
// import * as adminController from "../controllers/adminController.js";

// const router = express.Router();

// router.use(authMiddleware);
// router.use(adminOnly);

// // Admin overview (all branches)
// router.get("/overview", adminController.getAdminOverview);

// // Branch details (view all items in a branch)
// router.get("/branch/:branchId", adminController.getBranchDetails);

// export default router;

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js"; // Use your actual path
import  adminOnly  from "../middlewares/adminOnly.js"; // Use your actual path
import * as adminController from "../controllers/AdminController.js";

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticate);
router.use(adminOnly);

// Admin overview (all branches)
router.get("/overview", adminController.getAdminOverview);

// Branch summary/comparison
router.get("/branch-summary", adminController.getBranchSummary);

// Branch details (view all items in a branch)
router.get("/branch/:branchId", adminController.getBranchDetails);

// Category distribution
router.get("/category-distribution", adminController.getCategoryDistribution);

// User statistics
router.get("/users", adminController.getUserStats);
router.get("/all-users", authenticate, adminController.getAllUsers);
// Add this line with your other routes
router.get("/stock-trend", adminController.getStockTrend);

export default router;