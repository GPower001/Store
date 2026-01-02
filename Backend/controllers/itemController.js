// import multer, { diskStorage } from "multer";
// import Item from "../models/Item.js";
// import Notification from "../models/notificationModel.js"; // ✅ ADD THIS LINE
// import { extname } from "path";
// import { existsSync, mkdirSync } from "fs";

// /* ============================
//    FILE UPLOAD CONFIG
// ============================ */
// const storage = diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = "uploads/items";
//     if (!existsSync(uploadDir)) {
//       mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + extname(file.originalname));
//   },
// });

// export const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only images are allowed!"), false);
//     }
//   },
// });

// /* ============================
//    CONTROLLERS
// ============================ */

// /**
//  * @desc Get all items for branch
//  * @route GET /api/items
//  * @access Private
//  */
// export const getItems = async (req, res) => {
//   try {
//     const items = await Item.find({ branchId: req.user.branchId });
//     res.status(200).json({ success: true, data: items || [] });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// /**
//  * @desc Add new item
//  * @route POST /api/items
//  * @access Private
//  */
// export const addItem = async (req, res) => {
//   try {
//     const { name, category, openingQty, minStock, expiryDate, itemCode, price, dateAdded } = req.body;

//     // Log received data for debugging
//     console.log("Received data:", req.body);
//     console.log("User branchId:", req.user.branchId);

//     if (!name || !category) {
//       return res.status(400).json({
//         message: "Name and category are required",
//       });
//     }

//     // Validate openingQty and minStock
//     const qty = parseInt(openingQty) || 0;
//     const minStk = parseInt(minStock) || 0;

//     const cleanName =
//       name.trim().charAt(0).toUpperCase() +
//       name.trim().slice(1).toLowerCase();

//     const branchId = req.user.branchId;

//     if (!branchId) {
//       return res.status(400).json({ message: "Branch ID is required" });
//     }

//     // Check for duplicate name
//     const existingItemByName = await Item.findOne({
//       name: { $regex: new RegExp(`^${cleanName}$`, "i") },
//       category,
//       branchId,
//     });

//     if (existingItemByName) {
//       return res.status(400).json({ message: "Item already exists" });
//     }

//     // Check for duplicate item code
//     if (itemCode && itemCode.trim()) {
//       const existingItemByCode = await Item.findOne({
//         itemCode: itemCode.trim(),
//         branchId,
//       });

//       if (existingItemByCode) {
//         return res.status(400).json({ message: "Item code already exists" });
//       }
//     }

//     // Parse expiry date
//     let parsedExpiry;
//     if (expiryDate) {
//       parsedExpiry = new Date(expiryDate);
//       if (isNaN(parsedExpiry.getTime())) {
//         return res.status(400).json({ message: "Invalid expiry date format" });
//       }
//     }

//     // Create new item
//     const newItem = new Item({
//       name: cleanName,
//       category,
//       openingQty: qty,
//       minStock: minStk,
//       itemCode: itemCode ? itemCode.trim() : `ITEM-${Date.now()}`,
//       expiryDate: parsedExpiry,
//       branchId,
//       image: req.file ? `/uploads/items/${req.file.filename}` : null,
//       price: price ? parseFloat(price) : undefined,
//     });

//     const savedItem = await newItem.save();

//     // Check for low stock and create notification if needed
//     if (savedItem.openingQty <= savedItem.minStock) {
//       const exists = await Notification.findOne({
//         item: savedItem.name,
//         type: "low-stock",
//         branchId: savedItem.branchId
//       });

//       if (!exists) {
//         await Notification.create({
//           item: savedItem.name,
//           type: "low-stock",
//           message: `${savedItem.name} is low in stock`,
//           branchId: savedItem.branchId
//         });
//       }
//     }

//     res.status(201).json({ success: true, data: savedItem });

//   } catch (error) {
//     console.error("Add Item Error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error", 
//       error: error.message 
//     });
//   }
// };




// /**
//  * @desc Delete item
//  * @route DELETE /api/items/:id
//  * @access Private
//  */
// export const deleteItems = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedItem = await Item.findOneAndDelete({
//       _id: id,
//       branchId: req.user.branchId,
//     });

//     if (!deletedItem) {
//       return res.status(404).json({ message: "Item not found in this branch" });
//     }

//     res.status(200).json({ message: "Item deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to delete item", error });
//   }
// };

// /**
//  * @desc Get low stock items
//  * @route GET /api/items/low-stock
//  * @access Private
//  */
// export const getLowStockItems = async (req, res) => {
//   try {
//     const lowStockItems = await Item.find({
//       branchId: req.user.branchId,
//       $expr: { $lte: ["$openingQty", "$minStock"] },
//     });

//     res.status(200).json({ success: true, data: lowStockItems || [] });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// /**
//  * @desc Update item stock
//  * @route PUT /api/items/:id
//  * @access Private
//  */
// // export const updateItem = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { additionalStock } = req.body;

// //     if (typeof additionalStock !== "number") {
// //       return res.status(400).json({ message: "Invalid additional stock value" });
// //     }

// //     const updatedItem = await Item.findOneAndUpdate(
// //       { _id: id, branchId: req.user.branchId },
// //       { $inc: { openingQty: additionalStock } },
// //       { new: true }
// //     );

// //     if (!updatedItem) {
// //       return res.status(404).json({ message: "Item not found in this branch" });
// //     }

// //     res.status(200).json({ success: true, data: updatedItem });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server error", error });
// //   }
// // };


// /**
//  * @desc Update item (stock, minStock, price, expiryDate, etc.)
//  * @route PUT /api/items/:id
//  * @access Private
//  */
// export const updateItem = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       additionalStock,
//       minStock,
//       price,
//       expiryDate,
//       name,
//       category,
//       itemCode
//     } = req.body;

//     const item = await Item.findOne({
//       _id: id,
//       branchId: req.user.branchId
//     });

//     if (!item) {
//       return res.status(404).json({ message: "Item not found in this branch" });
//     }

//     if (typeof additionalStock === "number") {
//       item.openingQty += additionalStock;
//     }

//     if (typeof minStock === "number" && minStock >= 0) {
//       item.minStock = minStock;
//     }

//     if (typeof price === "number" && price >= 0) {
//       item.price = price;
//     }

//     if (expiryDate) {
//       const parsedExpiry = new Date(expiryDate);
//       if (isNaN(parsedExpiry.getTime())) {
//         return res.status(400).json({ message: "Invalid expiry date format" });
//       }
//       item.expiryDate = parsedExpiry;
//     }

//     if (name && name.trim()) {
//       const cleanName =
//         name.trim().charAt(0).toUpperCase() +
//         name.trim().slice(1).toLowerCase();

//       const duplicate = await Item.findOne({
//         _id: { $ne: id },
//         name: { $regex: new RegExp(`^${cleanName}$`, "i") },
//         branchId: req.user.branchId,
//       });

//       if (duplicate) {
//         return res.status(400).json({
//           message: "Item with this name already exists"
//         });
//       }

//       item.name = cleanName;
//     }

//     if (category && category.trim()) {
//       item.category = category.trim();
//     }

//     if (itemCode && itemCode.trim()) {
//       const duplicate = await Item.findOne({
//         _id: { $ne: id },
//         itemCode: itemCode.trim(),
//         branchId: req.user.branchId,
//       });

//       if (duplicate) {
//         return res.status(400).json({
//           message: "Item code already exists"
//         });
//       }

//       item.itemCode = itemCode.trim();
//     }

//     if (req.file) {
//       item.image = `/uploads/items/${req.file.filename}`;
//     }

//     const updatedItem = await item.save();

//     /* ============================
//        LOW STOCK NOTIFICATION
//     ============================ */
//     if (updatedItem.openingQty <= updatedItem.minStock) {
//       const exists = await Notification.findOne({
//         item: updatedItem.name,
//         type: "low-stock",
//         branchId: updatedItem.branchId
//       });

//       if (!exists) {
//         await Notification.create({
//           item: updatedItem.name,
//           type: "low-stock",
//           message: `${updatedItem.name} is low in stock`,
//           branchId: updatedItem.branchId
//         });
//       }
//     }

//     if (updatedItem.openingQty > updatedItem.minStock) {
//       await Notification.deleteMany({
//         item: updatedItem.name,
//         type: "low-stock",
//         branchId: updatedItem.branchId
//       });
//     }


//     res.status(200).json({ success: true, data: updatedItem });

//   } catch (error) {
//     console.error("Update Item Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// /**
//  * @desc Get expired items
//  * @route GET /api/items/expired
//  * @access Private
//  */
// export const getExpiredItems = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const expiredItems = await Item.find({
//       branchId: req.user.branchId,
//       expiryDate: { $exists: true, $ne: null, $lt: today },
//     });

//     res.status(200).json({ success: true, data: expiredItems || [] });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// /* ============================
//    CATEGORY-BASED FILTERS
// ============================ */

// /**
//  * @desc Get General items
//  * @route GET /api/items/general
//  * @access Private
//  */
// export const getGenerals = async (req, res) => {
//   try {
//     const items = await Item.find({
//       branchId: req.user.branchId,
//       category: "General",
//     });

//     res.status(200).json({ success: true, data: items || [] });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// /**
//  * @desc Get Consumables
//  * @route GET /api/items/consumables
//  * @access Private
//  */
// export const getConsumables = async (req, res) => {
//   try {
//     const items = await Item.find({
//       branchId: req.user.branchId,
//       category: "Consumables",
//     });

//     res.status(200).json({ success: true, data: items || [] });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// /**
//  * @desc Get Medications
//  * @route GET /api/items/medications
//  * @access Private
//  */
// export const getMedications = async (req, res) => {
//   try {
//     const items = await Item.find({
//       branchId: req.user.branchId,
//       category: "Medications",
//     });

//     res.status(200).json({ success: true, data: items || [] });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };


// import multer, { diskStorage } from "multer";
// import Item from "../models/Item.js";
// import Notification from "../models/notificationModel.js";
// import { extname } from "path";
// import { existsSync, mkdirSync } from "fs";

// /* ============================
//    FILE UPLOAD CONFIG
// ============================ */
// const storage = diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = "uploads/items";
//     if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + extname(file.originalname));
//   },
// });

// export const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) cb(null, true);
//     else cb(new Error("Only images are allowed!"), false);
//   },
// });

// /* ============================
//    HELPERS
// ============================ */

// // Resolve branchId from user, body, or query (admin-safe)
// const getBranchId = (req) => {
//   const branchId =
//     req.user?.branchId ||
//     req.body?.branchId ||
//     req.query?.branchId;

//   if (!branchId) {
//     throw new Error("Branch ID is required for this action");
//   }

//   return branchId;
// };

// const formatName = (name) =>
//   name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

// /* ============================
//    CONTROLLERS
// ============================ */

// /**
//  * @desc Get all items
//  * @route GET /api/items
//  */
// export const getItems = async (req, res) => {
//   try {
//     const branchId = getBranchId(req);
//     const items = await Item.find({ branchId });
//     res.status(200).json({ success: true, data: items || [] });
//   } catch (error) {
//     console.error("Get Items Error:", error);
//     res.status(400).json({ message: error.message });
//   }
// };

// /**
//  * @desc Add new item
//  * @route POST /api/items
//  */
// export const addItem = async (req, res) => {
//   try {
//     const { name, category, openingQty, minStock, expiryDate, itemCode, price } = req.body;

//     if (!name || !category) {
//       return res.status(400).json({ message: "Name and category are required" });
//     }

//     const branchId = getBranchId(req);

//     const qty = Number(openingQty) || 0;
//     const minStk = Number(minStock) || 0;
//     const cleanName = formatName(name);

//     const existingByName = await Item.findOne({
//       name: { $regex: new RegExp(`^${cleanName}$`, "i") },
//       category,
//       branchId,
//     });

//     if (existingByName) {
//       return res.status(400).json({ message: "Item already exists" });
//     }

//     if (itemCode?.trim()) {
//       const existingByCode = await Item.findOne({ itemCode: itemCode.trim(), branchId });
//       if (existingByCode) {
//         return res.status(400).json({ message: "Item code already exists" });
//       }
//     }

//     let parsedExpiry;
//     if (expiryDate) {
//       parsedExpiry = new Date(expiryDate);
//       if (isNaN(parsedExpiry.getTime())) {
//         return res.status(400).json({ message: "Invalid expiry date" });
//       }
//     }

//     const newItem = new Item({
//       name: cleanName,
//       category,
//       openingQty: qty,
//       minStock: minStk,
//       itemCode: itemCode?.trim() || `ITEM-${Date.now()}`,
//       expiryDate: parsedExpiry,
//       branchId,
//       image: req.file ? `/uploads/items/${req.file.filename}` : null,
//       price: price !== undefined ? Number(price) : undefined,
//     });

//     const savedItem = await newItem.save();

//     if (savedItem.openingQty <= savedItem.minStock) {
//       await Notification.findOneAndUpdate(
//         { item: savedItem.name, type: "low-stock", branchId },
//         {
//           item: savedItem.name,
//           type: "low-stock",
//           message: `${savedItem.name} is low in stock`,
//           branchId,
//         },
//         { upsert: true, new: true }
//       );
//     }

//     res.status(201).json({ success: true, data: savedItem });
//   } catch (error) {
//     console.error("Add Item Error:", error);
//     res.status(400).json({ message: error.message });
//   }
// };

// /**
//  * @desc Update item
//  * @route PATCH /api/items/:id
//  */
// export const updateItem = async (req, res) => {
//   try {
//     const { id } = req.params;

//     let branchId = req.user?.branchId;

//     // ✅ Admins derive branchId from item
//     if (!branchId && req.user.role === "Admin") {
//       const existingItem = await Item.findById(id).select("branchId");
//       if (!existingItem) {
//         return res.status(404).json({ message: "Item not found" });
//       }
//       branchId = existingItem.branchId;
//     }

//     if (!branchId) {
//       return res.status(400).json({ message: "Branch ID is required" });
//     }

//     const item = await Item.findOne({ _id: id, branchId });
//     if (!item) {
//       return res.status(404).json({ message: "Item not found in this branch" });
//     }

//     const {
//       additionalStock,
//       minStock,
//       price,
//       expiryDate,
//       name,
//       category,
//       itemCode,
//     } = req.body;

//     if (Number.isFinite(additionalStock)) item.openingQty += additionalStock;
//     if (Number.isFinite(minStock)) item.minStock = minStock;
//     if (Number.isFinite(price)) item.price = price;

//     if (expiryDate) {
//       const parsed = new Date(expiryDate);
//       if (isNaN(parsed.getTime())) {
//         return res.status(400).json({ message: "Invalid expiry date" });
//       }
//       item.expiryDate = parsed;
//     }

//     if (name?.trim()) item.name = name.trim();
//     if (category?.trim()) item.category = category.trim();
//     if (itemCode?.trim()) item.itemCode = itemCode.trim();

//     if (req.file) {
//       item.image = `/uploads/items/${req.file.filename}`;
//     }

//     const updatedItem = await item.save();

//     res.status(200).json({ success: true, data: updatedItem });
//   } catch (error) {
//     console.error("Update Item Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// /**
//  * @desc Delete item
//  * @route DELETE /api/items/:id
//  */
// export const deleteItems = async (req, res) => {
//   try {
//     const { id } = req.params;

//     let branchId = req.user?.branchId;

//     // ✅ Admins derive branchId from item
//     if (!branchId && req.user.role === "Admin") {
//       const existingItem = await Item.findById(id).select("branchId name");
//       if (!existingItem) {
//         return res.status(404).json({ message: "Item not found" });
//       }
//       branchId = existingItem.branchId;
//     }

//     if (!branchId) {
//       return res.status(400).json({ message: "Branch ID is required" });
//     }

//     const deletedItem = await Item.findOneAndDelete({
//       _id: id,
//       branchId,
//     });

//     if (!deletedItem) {
//       return res.status(404).json({
//         message: "Item not found in this branch",
//       });
//     }

//     // Clean up notifications
//     await Notification.deleteMany({
//       item: deletedItem.name,
//       branchId,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Item deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete Item Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };


// /* ============================
//    FILTERED GETTERS
// ============================ */
// const getItemsByQuery = async (req, res, query) => {
//   try {
//     const branchId = getBranchId(req);
//     const items = await Item.find({ branchId, ...query });
//     res.status(200).json({ success: true, data: items || [] });
//   } catch (error) {
//     console.error("Get Items Error:", error);
//     res.status(400).json({ message: error.message });
//   }
// };

// export const getLowStockItems = (req, res) =>
//   getItemsByQuery(req, res, { $expr: { $lte: ["$openingQty", "$minStock"] } });

// export const getExpiredItems = (req, res) => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   return getItemsByQuery(req, res, { expiryDate: { $lt: today } });
// };

// export const getGenerals = (req, res) => getItemsByQuery(req, res, { category: "General" });
// export const getConsumables = (req, res) => getItemsByQuery(req, res, { category: "Consumables" });
// export const getMedications = (req, res) => getItemsByQuery(req, res, { category: "Medications" });

import multer, { diskStorage } from "multer";
import Item from "../models/Item.js";
import Notification from "../models/notificationModel.js";
import StockMovement from "../models/StockMovement.js";
import { extname } from "path";
import { existsSync, mkdirSync } from "fs";

/* ============================
   FILE UPLOAD CONFIG
============================ */
const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/items";
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed!"), false);
  },
});

/* ============================
   HELPERS
============================ */

// Resolve branchId from user, body, or query (admin-safe)
const getBranchId = (req) => {
  const branchId =
    req.user?.branchId ||
    req.body?.branchId ||
    req.query?.branchId ||
    req.headers['x-branch-id'];

  if (!branchId) {
    throw new Error("Branch ID is required for this action");
  }

  return branchId;
};

const formatName = (name) =>
  name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

/**
 * Record stock movement helper
 */
const recordStockMovement = async (itemId, branchId, userId, movementType, quantity, previousQty, newQty, reason, notes = "") => {
  try {
    await StockMovement.create({
      itemId,
      branchId,
      userId,
      movementType,
      quantity: Math.abs(quantity),
      previousQuantity: previousQty,
      newQuantity: newQty,
      reason,
      notes
    });
    console.log(`✅ Stock movement recorded: ${movementType} - ${quantity} units`);
  } catch (error) {
    console.error("❌ Error recording stock movement:", error);
    // Don't throw - we don't want to fail the main operation if movement recording fails
  }
};

/* ============================
   CONTROLLERS
============================ */

/**
 * @desc Get all items
 * @route GET /api/items
 */
export const getItems = async (req, res) => {
  try {
    const branchId = getBranchId(req);
    const items = await Item.find({ branchId });
    res.status(200).json({ success: true, data: items || [] });
  } catch (error) {
    console.error("Get Items Error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Add new item
 * @route POST /api/items
 */
export const addItem = async (req, res) => {
  try {
    const { name, category, openingQty, minStock, expiryDate, itemCode, price } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    const branchId = getBranchId(req);
    const userId = req.user.id;

    const qty = Number(openingQty) || 0;
    const minStk = Number(minStock) || 0;
    const cleanName = formatName(name);

    const existingByName = await Item.findOne({
      name: { $regex: new RegExp(`^${cleanName}$`, "i") },
      category,
      branchId,
    });

    if (existingByName) {
      return res.status(400).json({ message: "Item already exists" });
    }

    if (itemCode?.trim()) {
      const existingByCode = await Item.findOne({ itemCode: itemCode.trim(), branchId });
      if (existingByCode) {
        return res.status(400).json({ message: "Item code already exists" });
      }
    }

    let parsedExpiry;
    if (expiryDate) {
      parsedExpiry = new Date(expiryDate);
      if (isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({ message: "Invalid expiry date" });
      }
    }

    const newItem = new Item({
      name: cleanName,
      category,
      openingQty: qty,
      minStock: minStk,
      itemCode: itemCode?.trim() || `ITEM-${Date.now()}`,
      expiryDate: parsedExpiry,
      branchId,
      image: req.file ? `/uploads/items/${req.file.filename}` : null,
      price: price !== undefined ? Number(price) : undefined,
    });

    const savedItem = await newItem.save();

    // 🎯 Record stock movement for initial stock
    if (savedItem.openingQty > 0) {
      await recordStockMovement(
        savedItem._id,
        branchId,
        userId,
        "addition",
        savedItem.openingQty,
        0,
        savedItem.openingQty,
        "Initial stock - Item created",
        `New item "${savedItem.name}" added to inventory with opening stock of ${savedItem.openingQty}`
      );
    }

    // Check for low stock notification
    if (savedItem.openingQty <= savedItem.minStock) {
      await Notification.findOneAndUpdate(
        { item: savedItem.name, type: "low-stock", branchId },
        {
          item: savedItem.name,
          type: "low-stock",
          message: `${savedItem.name} is low in stock`,
          branchId,
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({ success: true, data: savedItem });
  } catch (error) {
    console.error("Add Item Error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update item
 * @route PATCH /api/items/:id  or  PUT /api/items/:id
 */
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let branchId = req.user?.branchId || req.headers['x-branch-id'];

    // ✅ Admins derive branchId from item
    if (!branchId && req.user.role === "Admin") {
      const existingItem = await Item.findById(id).select("branchId");
      if (!existingItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      branchId = existingItem.branchId;
    }

    if (!branchId) {
      return res.status(400).json({ message: "Branch ID is required" });
    }

    const item = await Item.findOne({ _id: id, branchId });
    if (!item) {
      return res.status(404).json({ message: "Item not found in this branch" });
    }

    const {
      additionalStock,
      minStock,
      price,
      expiryDate,
      name,
      category,
      itemCode,
    } = req.body;

    const previousQty = item.openingQty;

    // 🎯 Handle quantity changes and record stock movement
    if (Number.isFinite(additionalStock) && additionalStock !== 0) {
      const newQty = previousQty + additionalStock;
      
      if (newQty < 0) {
        return res.status(400).json({ message: "Cannot reduce quantity below zero" });
      }

      item.openingQty = newQty;

      // Determine movement type
      let movementType;
      let reason;
      if (additionalStock > 0) {
        movementType = "addition";
        reason = "Stock added via inventory update";
      } else {
        movementType = "removal";
        reason = "Stock removed via inventory update";
      }

      // Record the stock movement
      await recordStockMovement(
        item._id,
        branchId,
        userId,
        movementType,
        additionalStock,
        previousQty,
        newQty,
        reason,
        `Updated by ${req.user.name || req.user.email} from admin panel`
      );
    }

    // Update other fields
    if (Number.isFinite(minStock)) item.minStock = minStock;
    if (Number.isFinite(price)) item.price = price;

    if (expiryDate !== undefined) {
      if (expiryDate === null || expiryDate === "") {
        item.expiryDate = null;
      } else {
        const parsed = new Date(expiryDate);
        if (isNaN(parsed.getTime())) {
          return res.status(400).json({ message: "Invalid expiry date" });
        }
        item.expiryDate = parsed;
      }
    }

    if (name?.trim()) item.name = name.trim();
    if (category?.trim()) item.category = category.trim();
    if (itemCode?.trim()) item.itemCode = itemCode.trim();

    if (req.file) {
      item.image = `/uploads/items/${req.file.filename}`;
    }

    const updatedItem = await item.save();

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("Update Item Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Delete item
 * @route DELETE /api/items/:id
 */
export const deleteItems = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let branchId = req.user?.branchId || req.headers['x-branch-id'];

    // Find the item first to get its details
    const itemToDelete = await Item.findById(id).select("branchId name openingQty itemCode");
    
    if (!itemToDelete) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Use item's branchId if user doesn't have one (admin case)
    if (!branchId) {
      branchId = itemToDelete.branchId;
    }

    // 🎯 Record stock movement BEFORE deletion if there's remaining stock
    if (itemToDelete.openingQty > 0) {
      await recordStockMovement(
        itemToDelete._id,
        branchId,
        userId,
        "removal",
        itemToDelete.openingQty,
        itemToDelete.openingQty,
        0,
        "Item deleted from inventory",
        `${itemToDelete.name} (${itemToDelete.itemCode}) removed from system with ${itemToDelete.openingQty} units remaining`
      );
    }

    // Now delete the item
    const deletedItem = await Item.findOneAndDelete({
      _id: id,
      branchId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        message: "Item not found in this branch",
      });
    }

    // Clean up notifications
    await Notification.deleteMany({
      item: deletedItem.name,
      branchId,
    });

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete Item Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Manually adjust stock quantity (Optional - for direct adjustments)
 * @route POST /api/items/:id/adjust-stock
 */
export const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason, notes } = req.body;
    
    const branchId = req.headers['x-branch-id'] || req.user.branchId;
    const userId = req.user.id;

    if (!branchId) {
      return res.status(400).json({ message: "Branch ID is required" });
    }

    const item = await Item.findOne({ _id: id, branchId });
    if (!item) {
      return res.status(404).json({ message: "Item not found in this branch" });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }

    const previousQuantity = item.openingQty;
    const difference = quantity - previousQuantity;

    item.openingQty = quantity;
    await item.save();

    // Determine movement type
    let movementType = "adjustment";
    if (difference > 0) {
      movementType = "addition";
    } else if (difference < 0) {
      movementType = "removal";
    }

    // Record stock movement
    await recordStockMovement(
      item._id,
      branchId,
      userId,
      movementType,
      difference,
      previousQuantity,
      quantity,
      reason || "Manual stock adjustment",
      notes || ""
    );

    res.status(200).json({
      success: true,
      message: "Stock adjusted successfully",
      data: item
    });
  } catch (error) {
    console.error("Adjust Stock Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================
   FILTERED GETTERS
============================ */
const getItemsByQuery = async (req, res, query) => {
  try {
    const branchId = getBranchId(req);
    const items = await Item.find({ branchId, ...query });
    res.status(200).json({ success: true, data: items || [] });
  } catch (error) {
    console.error("Get Items Error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getLowStockItems = (req, res) =>
  getItemsByQuery(req, res, { $expr: { $lte: ["$openingQty", "$minStock"] } });

export const getExpiredItems = (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getItemsByQuery(req, res, { expiryDate: { $lt: today } });
};

export const getGenerals = (req, res) => getItemsByQuery(req, res, { category: "General" });
export const getConsumables = (req, res) => getItemsByQuery(req, res, { category: "Consumables" });
export const getMedications = (req, res) => getItemsByQuery(req, res, { category: "Medications" });