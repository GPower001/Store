// import Item from "../models/Item.js";
// import Branch from "../models/branchModel.js";
// import User from "../models/userModel.js";

// export const getAdminOverview = async (req, res) => {
//   try {
//     const branches = await Branch.find().lean();

//     let totalItems = 0;
//     let lowStockItems = 0;
//     let expiredItems = 0;
//     const today = new Date();

//     const branchDetails = await Promise.all(
//       branches.map(async (branch) => {
//         const items = await Item.find({ branchId: branch._id }).lean();
        
//         const low = items.filter(
//           (item) => item.openingQty <= (item.minStock || 0)
//         ).length;
        
//         const expired = items.filter(
//           (item) => item.expiryDate && new Date(item.expiryDate) < today
//         ).length;

//         totalItems += items.length;
//         lowStockItems += low;
//         expiredItems += expired;

//         return {
//           _id: branch._id,
//           branchName: branch.name,
//           location: branch.location,
//           totalItems: items.length,
//           lowStockItems: low,
//           expiredItems: expired,
//         };
//       })
//     );

//     // ADD THIS LINE - Get total user count
//     const totalUsers = await User.countDocuments();

//     res.status(200).json({
//       success: true,
//       data: {
//         totalBranches: branches.length,
//         totalItems,
//         lowStockItems,
//         expiredItems,
//         totalUsers, // ADD THIS LINE
//         branches: branchDetails,
//       },
//     });
//   } catch (error) {
//     console.error("Admin Overview Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// /**
//  * @desc Get branch comparison/summary
//  * @route GET /api/admin/branch-summary
//  * @access Private/Admin
//  */
// export const getBranchSummary = async (req, res) => {
//   try {
//     const summary = await Item.aggregate([
//       {
//         $group: {
//           _id: "$branchId",
//           totalQty: { $sum: "$openingQty" },
//           totalItems: { $sum: 1 },
//           lowStock: {
//             $sum: {
//               $cond: [{ $lte: ["$openingQty", "$minStock"] }, 1, 0]
//             }
//           },
//           avgStock: { $avg: "$openingQty" }
//         }
//       },
//       {
//         $lookup: {
//           from: "branches",
//           localField: "_id",
//           foreignField: "_id",
//           as: "branch"
//         }
//       },
//       { $unwind: "$branch" },
//       {
//         $project: {
//           branchId: "$_id",
//           branchName: "$branch.name",
//           location: "$branch.location",
//           totalItems: 1,
//           totalQty: 1,
//           lowStock: 1,
//           avgStock: { $round: ["$avgStock", 2] }
//         }
//       },
//       { $sort: { totalItems: -1 } }
//     ]);

//     res.status(200).json({
//       success: true,
//       data: summary
//     });
//   } catch (error) {
//     console.error("Branch Summary Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// /**
//  * @desc Get detailed information for a specific branch
//  * @route GET /api/admin/branch/:branchId
//  * @access Private/Admin
//  */
// export const getBranchDetails = async (req, res) => {
//   try {
//     const { branchId } = req.params;
//     const { filter } = req.query;

//     const branch = await Branch.findById(branchId).lean();
//     if (!branch) {
//       return res.status(404).json({ message: "Branch not found" });
//     }

//     let query = { branchId };
//     const today = new Date();

//     // Apply filters
//     if (filter === "lowstock") {
//       query.$expr = { $lte: ["$openingQty", "$minStock"] };
//     } else if (filter === "expired") {
//       query.expiryDate = { $lt: today };
//     }

//     const items = await Item.find(query)
//       .sort({ openingQty: 1 })
//       .lean();

//     res.status(200).json({
//       success: true,
//       data: {
//         branch,
//         items,
//         stats: {
//           totalItems: items.length,
//           lowStock: items.filter(i => i.openingQty <= (i.minStock || 0)).length,
//           expired: items.filter(i => i.expiryDate && new Date(i.expiryDate) < today).length
//         }
//       },
//     });
//   } catch (error) {
//     console.error("Branch Details Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// /**
//  * @desc Get category-wise distribution across all branches
//  * @route GET /api/admin/category-distribution
//  * @access Private/Admin
//  */
// export const getCategoryDistribution = async (req, res) => {
//   try {
//     const distribution = await Item.aggregate([
//       {
//         $group: {
//           _id: {
//             category: "$category",
//             branchId: "$branchId"
//           },
//           count: { $sum: 1 },
//           totalQty: { $sum: "$openingQty" }
//         }
//       },
//       {
//         $lookup: {
//           from: "branches",
//           localField: "_id.branchId",
//           foreignField: "_id",
//           as: "branch"
//         }
//       },
//       { $unwind: "$branch" },
//       {
//         $group: {
//           _id: "$_id.category",
//           totalItems: { $sum: "$count" },
//           totalQty: { $sum: "$totalQty" },
//           branches: {
//             $push: {
//               branchName: "$branch.name",
//               count: "$count",
//               qty: "$totalQty"
//             }
//           }
//         }
//       },
//       { $sort: { totalItems: -1 } }
//     ]);

//     res.status(200).json({
//       success: true,
//       data: distribution
//     });
//   } catch (error) {
//     console.error("Category Distribution Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// /**
//  * @desc Get user statistics
//  * @route GET /api/admin/users
//  * @access Private/Admin
//  */
// export const getUserStats = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const adminUsers = await User.countDocuments({ role: "Admin" });
//     const branchUsers = await User.countDocuments({ role: { $ne: "Admin" } });

//     const usersByBranch = await User.aggregate([
//       { $match: { branchId: { $ne: null } } },
//       {
//         $group: {
//           _id: "$branchId",
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $lookup: {
//           from: "branches",
//           localField: "_id",
//           foreignField: "_id",
//           as: "branch"
//         }
//       },
//       { $unwind: "$branch" },
//       {
//         $project: {
//           branchName: "$branch.name",
//           userCount: "$count"
//         }
//       }
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         totalUsers,
//         adminUsers,
//         branchUsers,
//         usersByBranch
//       }
//     });
//   } catch (error) {
//     console.error("User Stats Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// /**
//  * @desc Get all users with their details
//  * @route GET /api/admin/all-users
//  * @access Private/Admin
//  */
// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find()
//       .select("-password") // Exclude password field
//       .populate("branchId", "name location") // Populate branch details
//       .sort({ createdAt: -1 }) // Sort by newest first
//       .lean();

//     res.status(200).json({
//       success: true,
//       data: users
//     });
//   } catch (error) {
//     console.error("Get All Users Error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error", 
//       error: error.message 
//     });
//   }
// };

// /**
//  * @desc Get stock movement trend (last 7 days)
//  * @route GET /api/admin/stock-trend
//  * @access Private/Admin
//  */
// export const getStockTrend = async (req, res) => {
//   try {
//     const days = parseInt(req.query.days) || 7;
//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - days);

//     // Get items created in the last N days
//     const trend = await Item.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: startDate }
//         }
//       },
//       {
//         $group: {
//           _id: {
//             $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
//           },
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $sort: { _id: 1 }
//       }
//     ]);

//     // Fill in missing days with 0
//     const result = [];
//     for (let i = days - 1; i >= 0; i--) {
//       const date = new Date();
//       date.setDate(date.getDate() - i);
//       const dateStr = date.toISOString().split('T')[0];
      
//       const found = trend.find(t => t._id === dateStr);
//       result.push({
//         date: dateStr,
//         count: found ? found.count : 0
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: result
//     });
//   } catch (error) {
//     console.error("Stock Trend Error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error", 
//       error: error.message 
//     });
//   }
// };


import Item from "../models/Item.js";
import Branch from "../models/branchModel.js";
import User from "../models/userModel.js";
import Tenant from "../models/Tenant.js";

/**
 * @desc Get admin overview of all branches in tenant
 * @route GET /api/admin/overview
 * @access Private/Admin
 */
export const getAdminOverview = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // Get all branches for this tenant
    const branches = await Branch.find({ tenantId }).lean();

    let totalItems = 0;
    let lowStockItems = 0;
    let expiredItems = 0;
    const today = new Date();

    const branchDetails = await Promise.all(
      branches.map(async (branch) => {
        const items = await Item.find({ 
          branchId: branch._id,
          tenantId 
        }).lean();
        
        const low = items.filter(
          (item) => item.openingQty <= (item.minStock || 0)
        ).length;
        
        const expired = items.filter(
          (item) => item.expiryDate && new Date(item.expiryDate) < today
        ).length;

        totalItems += items.length;
        lowStockItems += low;
        expiredItems += expired;

        return {
          _id: branch._id,
          branchName: branch.name,
          location: branch.location,
          totalItems: items.length,
          lowStockItems: low,
          expiredItems: expired,
        };
      })
    );

    // Get total user count for this tenant
    const totalUsers = await User.countDocuments({ tenantId });

    // Get tenant info
    const tenant = await Tenant.findById(tenantId).select("companyName subscriptionTier");

    res.status(200).json({
      success: true,
      data: {
        tenant: {
          companyName: tenant?.companyName,
          subscriptionTier: tenant?.subscriptionTier,
        },
        totalBranches: branches.length,
        totalItems,
        lowStockItems,
        expiredItems,
        totalUsers,
        branches: branchDetails,
      },
    });
  } catch (error) {
    console.error("Admin Overview Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get branch comparison/summary
 * @route GET /api/admin/branch-summary
 * @access Private/Admin
 */
export const getBranchSummary = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const summary = await Item.aggregate([
      { $match: { tenantId: tenantId } },
      {
        $group: {
          _id: "$branchId",
          totalQty: { $sum: "$openingQty" },
          totalItems: { $sum: 1 },
          lowStock: {
            $sum: {
              $cond: [{ $lte: ["$openingQty", "$minStock"] }, 1, 0]
            }
          },
          avgStock: { $avg: "$openingQty" },
          totalValue: { $sum: { $multiply: ["$openingQty", "$price"] } }
        }
      },
      {
        $lookup: {
          from: "branches",
          localField: "_id",
          foreignField: "_id",
          as: "branch"
        }
      },
      { $unwind: "$branch" },
      {
        $match: { "branch.tenantId": tenantId }
      },
      {
        $project: {
          branchId: "$_id",
          branchName: "$branch.name",
          location: "$branch.location",
          totalItems: 1,
          totalQty: 1,
          lowStock: 1,
          avgStock: { $round: ["$avgStock", 2] },
          totalValue: { $round: ["$totalValue", 2] }
        }
      },
      { $sort: { totalItems: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error("Branch Summary Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get detailed information for a specific branch
 * @route GET /api/admin/branch/:branchId
 * @access Private/Admin
 */
export const getBranchDetails = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { filter } = req.query;
    const tenantId = req.user.tenantId;

    // Verify branch belongs to tenant
    const branch = await Branch.findOne({ _id: branchId, tenantId }).lean();
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    let query = { branchId, tenantId };
    const today = new Date();

    // Apply filters
    if (filter === "lowstock") {
      query.$expr = { $lte: ["$openingQty", "$minStock"] };
    } else if (filter === "expired") {
      query.expiryDate = { $lt: today };
    }

    const items = await Item.find(query)
      .sort({ openingQty: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        branch,
        items,
        stats: {
          totalItems: items.length,
          lowStock: items.filter(i => i.openingQty <= (i.minStock || 0)).length,
          expired: items.filter(i => i.expiryDate && new Date(i.expiryDate) < today).length
        }
      },
    });
  } catch (error) {
    console.error("Branch Details Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get category-wise distribution across all branches
 * @route GET /api/admin/category-distribution
 * @access Private/Admin
 */
export const getCategoryDistribution = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const distribution = await Item.aggregate([
      { $match: { tenantId: tenantId } },
      {
        $group: {
          _id: {
            category: "$category",
            branchId: "$branchId"
          },
          count: { $sum: 1 },
          totalQty: { $sum: "$openingQty" }
        }
      },
      {
        $lookup: {
          from: "branches",
          localField: "_id.branchId",
          foreignField: "_id",
          as: "branch"
        }
      },
      { $unwind: "$branch" },
      {
        $match: { "branch.tenantId": tenantId }
      },
      {
        $group: {
          _id: "$_id.category",
          totalItems: { $sum: "$count" },
          totalQty: { $sum: "$totalQty" },
          branches: {
            $push: {
              branchName: "$branch.name",
              count: "$count",
              qty: "$totalQty"
            }
          }
        }
      },
      { $sort: { totalItems: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error("Category Distribution Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get user statistics
 * @route GET /api/admin/users
 * @access Private/Admin
 */
export const getUserStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const totalUsers = await User.countDocuments({ tenantId });
    const adminUsers = await User.countDocuments({ role: "Admin", tenantId });
    const activeUsers = await User.countDocuments({ isActive: true, tenantId });

    const usersByBranch = await User.aggregate([
      { $match: { tenantId: tenantId, branchId: { $ne: null } } },
      {
        $group: {
          _id: "$branchId",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "branches",
          localField: "_id",
          foreignField: "_id",
          as: "branch"
        }
      },
      { $unwind: "$branch" },
      {
        $match: { "branch.tenantId": tenantId }
      },
      {
        $project: {
          branchName: "$branch.name",
          userCount: "$count"
        }
      }
    ]);

    const usersByRole = await User.aggregate([
      { $match: { tenantId: tenantId } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          role: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        adminUsers,
        activeUsers,
        usersByBranch,
        usersByRole,
      }
    });
  } catch (error) {
    console.error("User Stats Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all users with their details
 * @route GET /api/admin/all-users
 * @access Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const users = await User.find({ tenantId })
      .select("-password")
      .populate("branchId", "name location")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @desc Get stock movement trend (last N days)
 * @route GET /api/admin/stock-trend
 * @access Private/Admin
 */
export const getStockTrend = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get items created in the last N days for this tenant
    const trend = await Item.aggregate([
      {
        $match: {
          tenantId: tenantId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in missing days with 0
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const found = trend.find(t => t._id === dateStr);
      result.push({
        date: dateStr,
        count: found ? found.count : 0
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Stock Trend Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};