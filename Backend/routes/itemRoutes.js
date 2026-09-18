// import { Router } from "express";
// import {
//   addItem,
//   deleteItems,
//   getExpiredItems,
//   getItems,
//   getLowStockItems,
//   updateItem,
//   getGenerals,
//   getConsumables,
//   getMedications,
//   adjustStock,
//   upload,
// } from "../controllers/itemController.js";
// import { authenticate } from "../middlewares/authMiddleware.js";

// const router = Router();

// // ✅ All routes require authentication
// router.use(authenticate);

// // =============================================
// // FILTERED GET ROUTES (must come BEFORE /:id)
// // =============================================
// router.get("/low-stock", getLowStockItems);
// router.get("/expired", getExpiredItems);
// router.get("/generals", getGenerals);
// router.get("/consumables", getConsumables);
// router.get("/medications", getMedications);

// // MAIN CRUD ROUTES


// // GET all items for branch
// router.get("/", getItems);

// // POST new item (with optional image upload)
// router.post("/", upload.single("image"), addItem);

// // UPDATE item - support both PATCH and PUT
// router.patch("/:id", upload.single("image"), updateItem);
// router.put("/:id", upload.single("image"), updateItem);

// // DELETE item
// router.delete("/:id", deleteItems);

// // STOCK ADJUSTMENT ROUTE


// // POST manual stock adjustment
// router.post("/:id/adjust-stock", adjustStock);

// export default router;


import { Router } from "express";
import {
  addItem,
  deleteItems,
  getExpiredItems,
  getItems,
  getLowStockItems,
  updateItem,
  getGenerals,
  getConsumables,
  getMedications,
  adjustStock,
  upload,
} from "../controllers/itemController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { 
  checkResourceLimit,
  checkSubscriptionStatus 
} from "../middlewares/checkSubscriptionLimits.js";

const router = Router();

router.use(authenticate);
router.use(checkSubscriptionStatus);

// FILTERED GET ROUTES
router.get("/low-stock", getLowStockItems);
router.get("/expired", getExpiredItems);
router.get("/generals", getGenerals);
router.get("/consumables", getConsumables);
router.get("/medications", getMedications);

// MAIN CRUD ROUTES
router.get("/", getItems);
router.post(
  "/",
  checkResourceLimit("items"),
  upload.single("image"),
  addItem
);
router.patch("/:id", upload.single("image"), updateItem);
router.put("/:id", upload.single("image"), updateItem);
router.delete("/:id", deleteItems);

// STOCK ADJUSTMENT
router.post("/:id/adjust-stock", adjustStock);

export default router;