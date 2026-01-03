// import multer, { diskStorage } from "multer";
// import Item from "../models/Item.js";
// import Notification from "../models/notificationModel.js";
// import StockMovement from "../models/StockMovement.js";
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
//     req.query?.branchId ||
//     req.headers['x-branch-id'];

//   if (!branchId) {
//     throw new Error("Branch ID is required for this action");
//   }

//   return branchId;
// };

// const formatName = (name) =>
//   name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

// /**
//  * Record stock movement helper
//  */
// const recordStockMovement = async (itemId, branchId, userId, movementType, quantity, previousQty, newQty, reason, notes = "") => {
//   try {
//     await StockMovement.create({
//       itemId,
//       branchId,
//       userId,
//       movementType,
//       quantity: Math.abs(quantity),
//       previousQuantity: previousQty,
//       newQuantity: newQty,
//       reason,
//       notes
//     });
//     console.log(`✅ Stock movement recorded: ${movementType} - ${quantity} units`);
//   } catch (error) {
//     console.error("❌ Error recording stock movement:", error);
//     // Don't throw - we don't want to fail the main operation if movement recording fails
//   }
// };

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
//     const userId = req.user.id;

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

//     // 🎯 Record stock movement for initial stock
//     if (savedItem.openingQty > 0) {
//       await recordStockMovement(
//         savedItem._id,
//         branchId,
//         userId,
//         "addition",
//         savedItem.openingQty,
//         0,
//         savedItem.openingQty,
//         "Initial stock - Item created",
//         `New item "${savedItem.name}" added to inventory with opening stock of ${savedItem.openingQty}`
//       );
//     }

//     // Check for low stock notification
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
//  * @route PATCH /api/items/:id  or  PUT /api/items/:id
//  */
// export const updateItem = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     let branchId = req.user?.branchId || req.headers['x-branch-id'];

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

//     const previousQty = item.openingQty;

//     // 🎯 Handle quantity changes and record stock movement
//     if (Number.isFinite(additionalStock) && additionalStock !== 0) {
//       const newQty = previousQty + additionalStock;
      
//       if (newQty < 0) {
//         return res.status(400).json({ message: "Cannot reduce quantity below zero" });
//       }

//       item.openingQty = newQty;

//       // Determine movement type
//       let movementType;
//       let reason;
//       if (additionalStock > 0) {
//         movementType = "addition";
//         reason = "Stock added via inventory update";
//       } else {
//         movementType = "removal";
//         reason = "Stock removed via inventory update";
//       }

//       // Record the stock movement
//       await recordStockMovement(
//         item._id,
//         branchId,
//         userId,
//         movementType,
//         additionalStock,
//         previousQty,
//         newQty,
//         reason,
//         `Updated by ${req.user.name || req.user.email} from admin panel`
//       );
//     }

//     // Update other fields
//     if (Number.isFinite(minStock)) item.minStock = minStock;
//     if (Number.isFinite(price)) item.price = price;

//     if (expiryDate !== undefined) {
//       if (expiryDate === null || expiryDate === "") {
//         item.expiryDate = null;
//       } else {
//         const parsed = new Date(expiryDate);
//         if (isNaN(parsed.getTime())) {
//           return res.status(400).json({ message: "Invalid expiry date" });
//         }
//         item.expiryDate = parsed;
//       }
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
//     const userId = req.user.id;

//     let branchId = req.user?.branchId || req.headers['x-branch-id'];

//     // Find the item first to get its details
//     const itemToDelete = await Item.findById(id).select("branchId name openingQty itemCode");
    
//     if (!itemToDelete) {
//       return res.status(404).json({ message: "Item not found" });
//     }

//     // Use item's branchId if user doesn't have one (admin case)
//     if (!branchId) {
//       branchId = itemToDelete.branchId;
//     }

//     // 🎯 Record stock movement BEFORE deletion if there's remaining stock
//     if (itemToDelete.openingQty > 0) {
//       await recordStockMovement(
//         itemToDelete._id,
//         branchId,
//         userId,
//         "removal",
//         itemToDelete.openingQty,
//         itemToDelete.openingQty,
//         0,
//         "Item deleted from inventory",
//         `${itemToDelete.name} (${itemToDelete.itemCode}) removed from system with ${itemToDelete.openingQty} units remaining`
//       );
//     }

//     // Now delete the item
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

// /**
//  * @desc Manually adjust stock quantity (Optional - for direct adjustments)
//  * @route POST /api/items/:id/adjust-stock
//  */
// export const adjustStock = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { quantity, reason, notes } = req.body;
    
//     const branchId = req.headers['x-branch-id'] || req.user.branchId;
//     const userId = req.user.id;

//     if (!branchId) {
//       return res.status(400).json({ message: "Branch ID is required" });
//     }

//     const item = await Item.findOne({ _id: id, branchId });
//     if (!item) {
//       return res.status(404).json({ message: "Item not found in this branch" });
//     }

//     if (quantity < 0) {
//       return res.status(400).json({ message: "Quantity cannot be negative" });
//     }

//     const previousQuantity = item.openingQty;
//     const difference = quantity - previousQuantity;

//     item.openingQty = quantity;
//     await item.save();

//     // Determine movement type
//     let movementType = "adjustment";
//     if (difference > 0) {
//       movementType = "addition";
//     } else if (difference < 0) {
//       movementType = "removal";
//     }

//     // Record stock movement
//     await recordStockMovement(
//       item._id,
//       branchId,
//       userId,
//       movementType,
//       difference,
//       previousQuantity,
//       quantity,
//       reason || "Manual stock adjustment",
//       notes || ""
//     );

//     res.status(200).json({
//       success: true,
//       message: "Stock adjusted successfully",
//       data: item
//     });
//   } catch (error) {
//     console.error("Adjust Stock Error:", error);
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
const getTenantAndBranchId = (req) => {
  const tenantId = req.user.tenantId;
  const branchId = req.user.branchId || req.body?.branchId || req.query?.branchId;

  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }
  if (!branchId) {
    throw new Error("Branch ID is required");
  }

  return { tenantId, branchId };
};

const recordStockMovement = async (itemId, tenantId, branchId, userId, movementType, quantity, previousQty, newQty, reason, notes = "") => {
  try {
    await StockMovement.create({
      itemId,
      tenantId,
      branchId,
      userId,
      movementType,
      quantity: Math.abs(quantity),
      previousQuantity: previousQty,
      newQuantity: newQty,
      reason,
      notes
    });
  } catch (error) {
    console.error("Error recording stock movement:", error);
  }
};

/* ============================
   CONTROLLERS
============================ */

/**
 * @desc Get all items for tenant/branch
 * @route GET /api/items
 */
export const getItems = async (req, res) => {
  try {
    const { tenantId, branchId } = getTenantAndBranchId(req);
    
    const items = await Item.find({ tenantId, branchId })
      .sort({ createdAt: -1 });
    
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
    const { name, category, openingQty, minStock, expiryDate, itemCode, price, description, unit } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    const { tenantId, branchId } = getTenantAndBranchId(req);
    const userId = req.user.id;

    const qty = Number(openingQty) || 0;
    const minStk = Number(minStock) || 0;
    const cleanName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

    // Check if item exists in this tenant/branch
    const existingByName = await Item.findOne({
      name: { $regex: new RegExp(`^${cleanName}$`, "i") },
      category,
      tenantId,
      branchId,
    });

    if (existingByName) {
      return res.status(400).json({ message: "Item already exists in this branch" });
    }

    // Check item code uniqueness within tenant/branch
    if (itemCode?.trim()) {
      const existingByCode = await Item.findOne({ 
        itemCode: itemCode.trim(), 
        tenantId,
        branchId 
      });
      if (existingByCode) {
        return res.status(400).json({ message: "Item code already exists in this branch" });
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
      price: price !== undefined ? Number(price) : undefined,
      description,
      unit,
      tenantId,
      branchId,
      image: req.file ? `/uploads/items/${req.file.filename}` : null,
    });

    const savedItem = await newItem.save();

    // Record initial stock movement
    if (savedItem.openingQty > 0) {
      await recordStockMovement(
        savedItem._id,
        tenantId,
        branchId,
        userId,
        "addition",
        savedItem.openingQty,
        0,
        savedItem.openingQty,
        "Initial stock - Item created",
        `New item "${savedItem.name}" added with opening stock`
      );
    }

    // Check for low stock notification
    if (savedItem.openingQty <= savedItem.minStock) {
      await Notification.findOneAndUpdate(
        { item: savedItem.name, type: "low-stock", tenantId, branchId },
        {
          item: savedItem.name,
          itemId: savedItem._id,
          type: "low-stock",
          message: `${savedItem.name} is low in stock`,
          tenantId,
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
 * @route PATCH/PUT /api/items/:id
 */
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    let branchId = req.user?.branchId || req.headers['x-branch-id'];

    // Admins can derive branchId from item
    if (!branchId && req.user.role === "Admin") {
      const existingItem = await Item.findOne({ _id: id, tenantId }).select("branchId");
      if (!existingItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      branchId = existingItem.branchId;
    }

    if (!branchId) {
      return res.status(400).json({ message: "Branch ID is required" });
    }

    // Find item - MUST belong to same tenant
    const item = await Item.findOne({ _id: id, tenantId, branchId });
    if (!item) {
      return res.status(404).json({ message: "Item not found in your organization" });
    }

    const {
      additionalStock,
      minStock,
      price,
      expiryDate,
      name,
      category,
      itemCode,
      description,
      unit,
    } = req.body;

    const previousQty = item.openingQty;

    // Handle quantity changes
    if (Number.isFinite(additionalStock) && additionalStock !== 0) {
      const newQty = previousQty + additionalStock;
      
      if (newQty < 0) {
        return res.status(400).json({ message: "Cannot reduce quantity below zero" });
      }

      item.openingQty = newQty;

      const movementType = additionalStock > 0 ? "addition" : "removal";
      const reason = additionalStock > 0 
        ? "Stock added via inventory update" 
        : "Stock removed via inventory update";

      await recordStockMovement(
        item._id,
        tenantId,
        branchId,
        userId,
        movementType,
        additionalStock,
        previousQty,
        newQty,
        reason,
        `Updated by ${req.user.name || req.user.email}`
      );
    }

    // Update other fields
    if (Number.isFinite(minStock)) item.minStock = minStock;
    if (Number.isFinite(price)) item.price = price;
    if (name?.trim()) item.name = name.trim();
    if (category?.trim()) item.category = category.trim();
    if (itemCode?.trim()) item.itemCode = itemCode.trim();
    if (description !== undefined) item.description = description;
    if (unit?.trim()) item.unit = unit.trim();

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
    const tenantId = req.user.tenantId;

    let branchId = req.user?.branchId || req.headers['x-branch-id'];

    // Find item - MUST belong to same tenant
    const itemToDelete = await Item.findOne({ 
      _id: id, 
      tenantId 
    }).select("branchId name openingQty itemCode");
    
    if (!itemToDelete) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (!branchId) {
      branchId = itemToDelete.branchId;
    }

    // Record stock movement before deletion
    if (itemToDelete.openingQty > 0) {
      await recordStockMovement(
        itemToDelete._id,
        tenantId,
        branchId,
        userId,
        "removal",
        itemToDelete.openingQty,
        itemToDelete.openingQty,
        0,
        "Item deleted from inventory",
        `${itemToDelete.name} removed from system`
      );
    }

    // Delete item
    await Item.findOneAndDelete({ _id: id, tenantId, branchId });

    // Clean up notifications
    await Notification.deleteMany({
      itemId: itemToDelete._id,
      tenantId,
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
 * @desc Adjust stock quantity
 * @route POST /api/items/:id/adjust-stock
 */
export const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason, notes } = req.body;
    
    const tenantId = req.user.tenantId;
    const branchId = req.headers['x-branch-id'] || req.user.branchId;
    const userId = req.user.id;

    if (!branchId) {
      return res.status(400).json({ message: "Branch ID is required" });
    }

    const item = await Item.findOne({ _id: id, tenantId, branchId });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }

    const previousQuantity = item.openingQty;
    const difference = quantity - previousQuantity;

    item.openingQty = quantity;
    await item.save();

    let movementType = "adjustment";
    if (difference > 0) movementType = "addition";
    else if (difference < 0) movementType = "removal";

    await recordStockMovement(
      item._id,
      tenantId,
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
    const { tenantId, branchId } = getTenantAndBranchId(req);
    const items = await Item.find({ tenantId, branchId, ...query });
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