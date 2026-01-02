// import StockMovement from "../models/StockMovement.js";
// import Item from "../models/Item.js";
// import Branch from "../models/branchModel.js";
// import User from "../models/userModel.js";

// /**
//  * @desc Record a stock movement
//  * @route POST /api/stock-movements
//  * @access Private
//  */
// export const recordStockMovement = async (req, res) => {
//   try {
//     const { itemId, movementType, quantity, reason, notes } = req.body;
//     const userId = req.user.id;
//     const branchId = req.user.branchId;

//     // Get the item
//     const item = await Item.findById(itemId);
//     if (!item) {
//       return res.status(404).json({ message: "Item not found" });
//     }

//     const previousQuantity = item.openingQty;
//     let newQuantity;

//     // Calculate new quantity based on movement type
//     switch (movementType) {
//       case "addition":
//         newQuantity = previousQuantity + quantity;
//         break;
//       case "removal":
//         newQuantity = previousQuantity - quantity;
//         if (newQuantity < 0) {
//           return res.status(400).json({ 
//             message: "Cannot remove more than available quantity" 
//           });
//         }
//         break;
//       case "adjustment":
//         newQuantity = quantity; // Direct adjustment to specific quantity
//         break;
//       default:
//         return res.status(400).json({ message: "Invalid movement type" });
//     }

//     // Update item quantity
//     item.openingQty = newQuantity;
//     await item.save();

//     // Record the movement
//     const movement = await StockMovement.create({
//       itemId,
//       branchId,
//       userId,
//       movementType,
//       quantity: movementType === "adjustment" ? Math.abs(quantity - previousQuantity) : quantity,
//       previousQuantity,
//       newQuantity,
//       reason,
//       notes,
//     });

//     // Populate the movement with related data - ✅ FIXED: using "name" instead of "itemName"
//     const populatedMovement = await StockMovement.findById(movement._id)
//       .populate("itemId", "name category itemCode")
//       .populate("branchId", "name location")
//       .populate("userId", "name email");

//     res.status(201).json({
//       success: true,
//       data: populatedMovement,
//     });
//   } catch (error) {
//     console.error("Record Stock Movement Error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error", 
//       error: error.message 
//     });
//   }
// };

// /**
//  * @desc Get stock movements with filters
//  * @route GET /api/stock-movements
//  * @access Private
//  */
// export const getStockMovements = async (req, res) => {
//   try {
//     const { 
//       branchId, 
//       userId, 
//       movementType, 
//       startDate, 
//       endDate,
//       page = 1,
//       limit = 50 
//     } = req.query;

//     console.log("Fetching stock movements with params:", req.query);
//     console.log("User from token:", req.user);

//     // Build filter query
//     const filter = {};
    
//     if (branchId) filter.branchId = branchId;
//     if (userId) filter.userId = userId;
//     if (movementType) filter.movementType = movementType;
    
//     if (startDate || endDate) {
//       filter.createdAt = {};
//       if (startDate) filter.createdAt.$gte = new Date(startDate);
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter.createdAt.$lte = end;
//       }
//     }

//     // If user is not admin, restrict to their branch
//     if (req.user.role !== "Admin" && req.user.branchId) {
//       filter.branchId = req.user.branchId;
//     }

//     console.log("Filter being applied:", filter);

//     const skip = (page - 1) * limit;

//     // ✅ FIXED: Changed "itemName" to "name" to match Item schema
//     const movements = await StockMovement.find(filter)
//       .populate("itemId", "name category itemCode")
//       .populate("branchId", "name location")
//       .populate("userId", "name email")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit))
//       .lean();

//     console.log(`Found ${movements.length} movements`);
    
//     // Debug: Log first movement to verify population
//     if (movements.length > 0) {
//       console.log("First movement item:", movements[0].itemId);
//     }

//     const total = await StockMovement.countDocuments(filter);

//     res.status(200).json({
//       success: true,
//       data: movements,
//       pagination: {
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Get Stock Movements Error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error", 
//       error: error.message 
//     });
//   }
// };

// /**
//  * @desc Get stock movement statistics
//  * @route GET /api/stock-movements/stats
//  * @access Private/Admin
//  */
// export const getStockMovementStats = async (req, res) => {
//   try {
//     const { startDate, endDate, branchId } = req.query;

//     const filter = {};
    
//     if (startDate || endDate) {
//       filter.createdAt = {};
//       if (startDate) filter.createdAt.$gte = new Date(startDate);
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter.createdAt.$lte = end;
//       }
//     }

//     if (branchId) filter.branchId = branchId;

//     // Get statistics by movement type
//     const stats = await StockMovement.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: {
//             movementType: "$movementType",
//             branchId: "$branchId",
//             userId: "$userId",
//           },
//           count: { $sum: 1 },
//           totalQuantity: { $sum: "$quantity" },
//         },
//       },
//       {
//         $lookup: {
//           from: "branches",
//           localField: "_id.branchId",
//           foreignField: "_id",
//           as: "branch",
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id.userId",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       { $unwind: "$branch" },
//       { $unwind: "$user" },
//       {
//         $project: {
//           movementType: "$_id.movementType",
//           branchId: "$_id.branchId",
//           branchName: "$branch.name",
//           branchLocation: "$branch.location",
//           userId: "$_id.userId",
//           userName: "$user.name",
//           userEmail: "$user.email",
//           count: 1,
//           totalQuantity: 1,
//         },
//       },
//       { $sort: { branchName: 1, movementType: 1 } },
//     ]);

//     // Get summary by branch
//     const branchSummary = await StockMovement.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: {
//             branchId: "$branchId",
//             movementType: "$movementType",
//           },
//           count: { $sum: 1 },
//           totalQuantity: { $sum: "$quantity" },
//         },
//       },
//       {
//         $lookup: {
//           from: "branches",
//           localField: "_id.branchId",
//           foreignField: "_id",
//           as: "branch",
//         },
//       },
//       { $unwind: "$branch" },
//       {
//         $group: {
//           _id: "$_id.branchId",
//           branchName: { $first: "$branch.name" },
//           branchLocation: { $first: "$branch.location" },
//           additions: {
//             $sum: {
//               $cond: [{ $eq: ["$_id.movementType", "addition"] }, "$count", 0],
//             },
//           },
//           removals: {
//             $sum: {
//               $cond: [{ $eq: ["$_id.movementType", "removal"] }, "$count", 0],
//             },
//           },
//           adjustments: {
//             $sum: {
//               $cond: [{ $eq: ["$_id.movementType", "adjustment"] }, "$count", 0],
//             },
//           },
//           additionsQty: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$_id.movementType", "addition"] },
//                 "$totalQuantity",
//                 0,
//               ],
//             },
//           },
//           removalsQty: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$_id.movementType", "removal"] },
//                 "$totalQuantity",
//                 0,
//               ],
//             },
//           },
//           adjustmentsQty: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$_id.movementType", "adjustment"] },
//                 "$totalQuantity",
//                 0,
//               ],
//             },
//           },
//           totalMovements: { $sum: "$count" },
//         },
//       },
//       { $sort: { branchName: 1 } },
//     ]);

//     // Get daily trend
//     const dailyTrend = await StockMovement.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: {
//             date: {
//               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
//             },
//             movementType: "$movementType",
//           },
//           count: { $sum: 1 },
//           totalQuantity: { $sum: "$quantity" },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id.date",
//           additions: {
//             $sum: {
//               $cond: [{ $eq: ["$_id.movementType", "addition"] }, "$count", 0],
//             },
//           },
//           removals: {
//             $sum: {
//               $cond: [{ $eq: ["$_id.movementType", "removal"] }, "$count", 0],
//             },
//           },
//           adjustments: {
//             $sum: {
//               $cond: [{ $eq: ["$_id.movementType", "adjustment"] }, "$count", 0],
//             },
//           },
//           totalMovements: { $sum: "$count" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         detailedStats: stats,
//         branchSummary,
//         dailyTrend,
//       },
//     });
//   } catch (error) {
//     console.error("Get Stock Movement Stats Error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error", 
//       error: error.message 
//     });
//   }
// };

// /**
//  * @desc Get movements by user
//  * @route GET /api/stock-movements/by-user
//  * @access Private/Admin
//  */
// export const getMovementsByUser = async (req, res) => {
//   try {
//     const { startDate, endDate, branchId } = req.query;

//     const filter = {};
    
//     if (startDate || endDate) {
//       filter.createdAt = {};
//       if (startDate) filter.createdAt.$gte = new Date(startDate);
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter.createdAt.$lte = end;
//       }
//     }

//     if (branchId) filter.branchId = branchId;

//     const userStats = await StockMovement.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: {
//             userId: "$userId",
//             branchId: "$branchId",
//             movementType: "$movementType",
//           },
//           count: { $sum: 1 },
//           totalQuantity: { $sum: "$quantity" },
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id.userId",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       {
//         $lookup: {
//           from: "branches",
//           localField: "_id.branchId",
//           foreignField: "_id",
//           as: "branch",
//         },
//       },
//       { $unwind: "$user" },
//       { $unwind: "$branch" },
//       {
//         $group: {
//           _id: "$_id.userId",
//           userName: { $first: "$user.name" },
//           userEmail: { $first: "$user.email" },
//           branchName: { $first: "$branch.name" },
//           additions: {
//             $sum: {
//               $cond: [{ $eq: ["$_id.movementType", "addition"] }, "$count", 0],
//             },
//           },
//           removals: {
//             $sum: {
//               $cond: [{ $eq: ["$_id.movementType", "removal"] }, "$count", 0],
//             },
//           },
//           adjustments: {
//             $sum: {
//               $cond: [{ $eq: ["$_id.movementType", "adjustment"] }, "$count", 0],
//             },
//           },
//           totalMovements: { $sum: "$count" },
//           totalQuantity: { $sum: "$totalQuantity" },
//         },
//       },
//       { $sort: { totalMovements: -1 } },
//     ]);

//     res.status(200).json({
//       success: true,
//       data: userStats,
//     });
//   } catch (error) {
//     console.error("Get Movements By User Error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error", 
//       error: error.message 
//     });
//   }
// };


import StockMovement from "../models/StockMovement.js";
import Item from "../models/Item.js";

/**
 * @desc Record a stock movement
 * @route POST /api/stock-movements
 * @access Private
 */
export const recordStockMovement = async (req, res) => {
  try {
    const { itemId, movementType, quantity, reason, notes } = req.body;
    const userId = req.user.id;
    const branchId = req.user.branchId;

    // Get the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const previousQuantity = item.openingQty;
    let newQuantity;

    // Calculate new quantity based on movement type
    switch (movementType) {
      case "addition":
        newQuantity = previousQuantity + quantity;
        break;
      case "removal":
        newQuantity = previousQuantity - quantity;
        if (newQuantity < 0) {
          return res.status(400).json({ 
            message: "Cannot remove more than available quantity" 
          });
        }
        break;
      case "adjustment":
        newQuantity = quantity; // Direct adjustment to specific quantity
        break;
      default:
        return res.status(400).json({ message: "Invalid movement type" });
    }

    // Update item quantity
    item.openingQty = newQuantity;
    await item.save();

    // Record the movement
    const movement = await StockMovement.create({
      itemId,
      branchId,
      userId,
      movementType,
      quantity: movementType === "adjustment" ? Math.abs(quantity - previousQuantity) : quantity,
      previousQuantity,
      newQuantity,
      reason,
      notes,
    });

    // Populate the movement with related data - ✅ FIXED: using "name" instead of "itemName"
    const populatedMovement = await StockMovement.findById(movement._id)
      .populate("itemId", "name category itemCode")
      .populate("branchId", "name location")
      .populate("userId", "name email");

    res.status(201).json({
      success: true,
      data: populatedMovement,
    });
  } catch (error) {
    console.error("Record Stock Movement Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @desc Get stock movements with filters
 * @route GET /api/stock-movements
 * @access Private
 */
export const getStockMovements = async (req, res) => {
  try {
    const { 
      branchId, 
      userId, 
      movementType, 
      startDate, 
      endDate,
      page = 1,
      limit = 50 
    } = req.query;

    console.log("Fetching stock movements with params:", req.query);
    console.log("User from token:", req.user);

    // Build filter query
    const filter = {};
    
    if (branchId) filter.branchId = branchId;
    if (userId) filter.userId = userId;
    if (movementType) filter.movementType = movementType;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // If user is not admin, restrict to their branch
    if (req.user.role !== "Admin" && req.user.branchId) {
      filter.branchId = req.user.branchId;
    }

    console.log("Filter being applied:", filter);

    const skip = (page - 1) * limit;

    // ✅ UPDATED: Added "price" field for accounting reports
    const movements = await StockMovement.find(filter)
      .populate("itemId", "name category itemCode price")
      .populate("branchId", "name location")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log(`Found ${movements.length} movements`);
    
    // Debug: Log first movement to verify population
    if (movements.length > 0) {
      console.log("First movement item:", movements[0].itemId);
    }

    const total = await StockMovement.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: movements,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Stock Movements Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};
/**
 * @desc Get stock movement statistics
 * @route GET /api/stock-movements/stats
 * @access Private/Admin
 */
export const getStockMovementStats = async (req, res) => {
  try {
    const { startDate, endDate, branchId } = req.query;

    const filter = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (branchId) filter.branchId = branchId;

    // Get statistics by movement type
    const stats = await StockMovement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            movementType: "$movementType",
            branchId: "$branchId",
            userId: "$userId",
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "_id.branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$branch" },
      { $unwind: "$user" },
      {
        $project: {
          movementType: "$_id.movementType",
          branchId: "$_id.branchId",
          branchName: "$branch.name",
          branchLocation: "$branch.location",
          userId: "$_id.userId",
          userName: "$user.name",
          userEmail: "$user.email",
          count: 1,
          totalQuantity: 1,
        },
      },
      { $sort: { branchName: 1, movementType: 1 } },
    ]);

    // Get summary by branch
    const branchSummary = await StockMovement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            branchId: "$branchId",
            movementType: "$movementType",
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "_id.branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: "$branch" },
      {
        $group: {
          _id: "$_id.branchId",
          branchName: { $first: "$branch.name" },
          branchLocation: { $first: "$branch.location" },
          additions: {
            $sum: {
              $cond: [{ $eq: ["$_id.movementType", "addition"] }, "$count", 0],
            },
          },
          removals: {
            $sum: {
              $cond: [{ $eq: ["$_id.movementType", "removal"] }, "$count", 0],
            },
          },
          adjustments: {
            $sum: {
              $cond: [{ $eq: ["$_id.movementType", "adjustment"] }, "$count", 0],
            },
          },
          additionsQty: {
            $sum: {
              $cond: [
                { $eq: ["$_id.movementType", "addition"] },
                "$totalQuantity",
                0,
              ],
            },
          },
          removalsQty: {
            $sum: {
              $cond: [
                { $eq: ["$_id.movementType", "removal"] },
                "$totalQuantity",
                0,
              ],
            },
          },
          adjustmentsQty: {
            $sum: {
              $cond: [
                { $eq: ["$_id.movementType", "adjustment"] },
                "$totalQuantity",
                0,
              ],
            },
          },
          totalMovements: { $sum: "$count" },
        },
      },
      { $sort: { branchName: 1 } },
    ]);

    // Get daily trend
    const dailyTrend = await StockMovement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            movementType: "$movementType",
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          additions: {
            $sum: {
              $cond: [{ $eq: ["$_id.movementType", "addition"] }, "$count", 0],
            },
          },
          removals: {
            $sum: {
              $cond: [{ $eq: ["$_id.movementType", "removal"] }, "$count", 0],
            },
          },
          adjustments: {
            $sum: {
              $cond: [{ $eq: ["$_id.movementType", "adjustment"] }, "$count", 0],
            },
          },
          totalMovements: { $sum: "$count" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        detailedStats: stats,
        branchSummary,
        dailyTrend,
      },
    });
  } catch (error) {
    console.error("Get Stock Movement Stats Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @desc Get movements by user
 * @route GET /api/stock-movements/by-user
 * @access Private/Admin
 */
export const getMovementsByUser = async (req, res) => {
  try {
    const { startDate, endDate, branchId } = req.query;

    const filter = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (branchId) filter.branchId = branchId;

    const userStats = await StockMovement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            userId: "$userId",
            branchId: "$branchId",
            movementType: "$movementType",
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "_id.branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: "$user" },
      { $unwind: "$branch" },
      {
        $group: {
          _id: "$_id.userId",
          userName: { $first: "$user.name" },
          userEmail: { $first: "$user.email" },
          branchName: { $first: "$branch.name" },
          additions: {
            $sum: {
              $cond: [{ $eq: ["$_id.movementType", "addition"] }, "$count", 0],
            },
          },
          removals: {
            $sum: {
              $cond: [{ $eq: ["$_id.movementType", "removal"] }, "$count", 0],
            },
          },
          adjustments: {
            $sum: {
              $cond: [{ $eq: ["$_id.movementType", "adjustment"] }, "$count", 0],
            },
          },
          totalMovements: { $sum: "$count" },
          totalQuantity: { $sum: "$totalQuantity" },
        },
      },
      { $sort: { totalMovements: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: userStats,
    });
  } catch (error) {
    console.error("Get Movements By User Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};