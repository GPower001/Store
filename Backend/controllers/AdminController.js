import Item from "../models/Item.js";
import Branch from "../models/branchModel.js";
import User from "../models/userModel.js";
import Tenant from "../models/Tenant.js";
import StockMovement from "../models/StockMovement.js"; 

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

/**
 * @desc Get recent activity feed for admin dashboard
 * @route GET /api/admin/activity-feed
 * @access Private/Admin
 * 
 * Shows real-time feed of all inventory activities
 */
export const getActivityFeed = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { 
      limit = 50, 
      branchId, 
      userId, 
      movementType,
      startDate, 
      endDate,
      page = 1
    } = req.query;

    // Build filter
    const filter = { tenantId };
    
    if (branchId && branchId !== 'all') {
      filter.branchId = branchId;
    }
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (movementType) {
      filter.movementType = movementType;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const totalCount = await StockMovement.countDocuments(filter);

    // Get stock movements with populated data
    const activities = await StockMovement.find(filter)
      .populate('itemId', 'name category itemCode image')
      .populate('branchId', 'name location')
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Format for display
    const formattedActivities = activities.map(activity => {
      let actionText = '';
      let actionColor = 'blue';
      let icon = '📦';
      
      switch(activity.movementType) {
        case 'addition':
          actionText = `Added ${activity.quantity} units`;
          actionColor = 'green';
          icon = '➕';
          break;
        case 'removal':
          actionText = `Removed ${activity.quantity} units`;
          actionColor = 'red';
          icon = '➖';
          break;
        case 'adjustment':
          actionText = `Adjusted stock from ${activity.previousQuantity} to ${activity.newQuantity} units`;
          actionColor = 'orange';
          icon = '🔄';
          break;
        case 'transfer':
          actionText = `Transferred ${activity.quantity} units`;
          actionColor = 'purple';
          icon = '🚚';
          break;
        default:
          actionText = `Modified ${activity.quantity} units`;
          icon = '📝';
      }

      return {
        id: activity._id,
        timestamp: activity.createdAt,
        timeAgo: getTimeAgo(activity.createdAt),
        user: activity.userId ? {
          id: activity.userId._id,
          name: activity.userId.name,
          email: activity.userId.email,
          role: activity.userId.role
        } : {
          name: "Unknown User",
          email: "N/A",
          role: "N/A"
        },
        item: activity.itemId ? {
          id: activity.itemId._id,
          name: activity.itemId.name,
          category: activity.itemId.category,
          code: activity.itemId.itemCode,
          image: activity.itemId.image
        } : {
          name: "Deleted Item",
          category: "N/A",
          code: "N/A"
        },
        branch: activity.branchId ? {
          id: activity.branchId._id,
          name: activity.branchId.name,
          location: activity.branchId.location
        } : {
          name: "Unknown Branch",
          location: "N/A"
        },
        action: actionText,
        icon: icon,
        color: actionColor,
        movementType: activity.movementType,
        quantity: activity.quantity,
        previousQuantity: activity.previousQuantity,
        newQuantity: activity.newQuantity,
        reason: activity.reason || 'No reason provided',
        notes: activity.notes || ''
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        activities: formattedActivities,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: totalPages,
          hasMore: parseInt(page) < totalPages
        }
      }
    });

  } catch (error) {
    console.error("Get Activity Feed Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity feed",
      error: error.message
    });
  }
};

/**
 * @desc Get detailed activity for a specific user
 * @route GET /api/admin/users/:userId/activity
 * @access Private/Admin
 * 
 * Shows complete timeline of what a user has done
 */
export const getUserActivity = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { userId } = req.params;
    const { days = 30, limit = 100 } = req.query;

    // Get user info
    const user = await User.findOne({ _id: userId, tenantId })
      .select('name email role branchId createdAt isActive')
      .populate('branchId', 'name location')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get activities
    const activities = await StockMovement.find({
      tenantId,
      userId,
      createdAt: { $gte: startDate }
    })
      .populate('itemId', 'name category itemCode')
      .populate('branchId', 'name location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Calculate statistics
    const stats = {
      totalActions: activities.length,
      additions: activities.filter(a => a.movementType === 'addition').length,
      removals: activities.filter(a => a.movementType === 'removal').length,
      adjustments: activities.filter(a => a.movementType === 'adjustment').length,
      transfers: activities.filter(a => a.movementType === 'transfer').length,
      totalQuantityAdded: activities
        .filter(a => a.movementType === 'addition')
        .reduce((sum, a) => sum + a.quantity, 0),
      totalQuantityRemoved: activities
        .filter(a => a.movementType === 'removal')
        .reduce((sum, a) => sum + a.quantity, 0)
    };

    // Find busiest day
    const dailyCount = {};
    activities.forEach(activity => {
      const date = activity.createdAt.toISOString().split('T')[0];
      dailyCount[date] = (dailyCount[date] || 0) + 1;
    });
    
    const busiestDay = Object.entries(dailyCount)
      .sort(([,a], [,b]) => b - a)[0];

    // Group activities by day
    const activitiesByDay = {};
    activities.forEach(activity => {
      const date = activity.createdAt.toISOString().split('T')[0];
      if (!activitiesByDay[date]) {
        activitiesByDay[date] = [];
      }
      activitiesByDay[date].push({
        id: activity._id,
        timestamp: activity.createdAt,
        time: activity.createdAt.toLocaleTimeString(),
        action: activity.movementType,
        item: activity.itemId?.name || 'Unknown Item',
        category: activity.itemId?.category,
        quantity: activity.quantity,
        previousQuantity: activity.previousQuantity,
        newQuantity: activity.newQuantity,
        branch: activity.branchId?.name || 'Unknown Branch',
        reason: activity.reason,
        notes: activity.notes
      });
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          branch: user.branchId,
          memberSince: user.createdAt,
          isActive: user.isActive
        },
        period: {
          days: parseInt(days),
          start: startDate,
          end: new Date()
        },
        statistics: {
          ...stats,
          averageActionsPerDay: (stats.totalActions / parseInt(days)).toFixed(2),
          busiestDay: busiestDay ? {
            date: busiestDay[0],
            actions: busiestDay[1]
          } : null
        },
        activitiesByDay: activitiesByDay,
        recentActivities: activities.slice(0, 20).map(a => ({
          timestamp: a.createdAt,
          timeAgo: getTimeAgo(a.createdAt),
          action: a.movementType,
          item: a.itemId?.name || 'Unknown Item',
          quantity: a.quantity,
          branch: a.branchId?.name || 'Unknown Branch',
          reason: a.reason
        }))
      }
    });

  } catch (error) {
    console.error("Get User Activity Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user activity",
      error: error.message
    });
  }
};

/**
 * @desc Get activity statistics for dashboard
 * @route GET /api/admin/activity-stats
 * @access Private/Admin
 * 
 * Shows overall activity metrics
 */
export const getActivityStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get all activities in period
    const activities = await StockMovement.find({
      tenantId,
      createdAt: { $gte: startDate }
    }).lean();

    // Calculate stats
    const stats = {
      totalActivities: activities.length,
      additions: activities.filter(a => a.movementType === 'addition').length,
      removals: activities.filter(a => a.movementType === 'removal').length,
      adjustments: activities.filter(a => a.movementType === 'adjustment').length,
      transfers: activities.filter(a => a.movementType === 'transfer').length
    };

    // Activity by day (for chart)
    const dailyActivity = {};
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyActivity[dateStr] = 0;
    }

    activities.forEach(activity => {
      const dateStr = activity.createdAt.toISOString().split('T')[0];
      if (dailyActivity.hasOwnProperty(dateStr)) {
        dailyActivity[dateStr]++;
      }
    });

    // Most active users
    const userActivity = {};
    activities.forEach(activity => {
      const userId = activity.userId?.toString();
      if (userId) {
        userActivity[userId] = (userActivity[userId] || 0) + 1;
      }
    });

    const topUserIds = Object.entries(userActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([userId]) => userId);

    const topUsers = await User.find({
      _id: { $in: topUserIds },
      tenantId
    }).select('name email role').lean();

    const topUsersWithActivity = topUsers.map(user => ({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      activityCount: userActivity[user._id.toString()]
    })).sort((a, b) => b.activityCount - a.activityCount);

    // Most active branches
    const branchActivity = {};
    activities.forEach(activity => {
      const branchId = activity.branchId?.toString();
      if (branchId) {
        branchActivity[branchId] = (branchActivity[branchId] || 0) + 1;
      }
    });

    const topBranchIds = Object.entries(branchActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([branchId]) => branchId);

    const topBranches = await Branch.find({
      _id: { $in: topBranchIds },
      tenantId
    }).select('name location').lean();

    const topBranchesWithActivity = topBranches.map(branch => ({
      branch: {
        id: branch._id,
        name: branch.name,
        location: branch.location
      },
      activityCount: branchActivity[branch._id.toString()]
    })).sort((a, b) => b.activityCount - a.activityCount);

    res.status(200).json({
      success: true,
      data: {
        period: {
          days: parseInt(days),
          start: startDate,
          end: new Date()
        },
        overview: stats,
        dailyActivity: Object.entries(dailyActivity).map(([date, count]) => ({
          date,
          count
        })),
        topUsers: topUsersWithActivity,
        topBranches: topBranchesWithActivity
      }
    });

  } catch (error) {
    console.error("Get Activity Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity statistics",
      error: error.message
    });
  }
};

/**
 * @desc Get activity for a specific item
 * @route GET /api/admin/items/:itemId/activity
 * @access Private/Admin
 * 
 * Shows complete history of an item
 */
export const getItemActivity = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { itemId } = req.params;

    // Get item info
    const item = await Item.findOne({ _id: itemId, tenantId })
      .select('name category itemCode openingQty minStock price expiryDate branchId createdAt')
      .populate('branchId', 'name location')
      .lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    // Get all activities for this item
    const activities = await StockMovement.find({
      tenantId,
      itemId
    })
      .populate('userId', 'name email role')
      .populate('branchId', 'name location')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate statistics
    const stats = {
      totalMovements: activities.length,
      totalAdded: activities
        .filter(a => a.movementType === 'addition')
        .reduce((sum, a) => sum + a.quantity, 0),
      totalRemoved: activities
        .filter(a => a.movementType === 'removal')
        .reduce((sum, a) => sum + a.quantity, 0),
      currentStock: item.openingQty,
      firstActivity: activities[activities.length - 1]?.createdAt,
      lastActivity: activities[0]?.createdAt,
      uniqueUsers: [...new Set(activities.map(a => a.userId?._id?.toString()))].length
    };

    // Format timeline
    const timeline = activities.map(activity => ({
      id: activity._id,
      timestamp: activity.createdAt,
      timeAgo: getTimeAgo(activity.createdAt),
      user: activity.userId ? {
        name: activity.userId.name,
        role: activity.userId.role
      } : { name: 'Unknown User', role: 'N/A' },
      action: activity.movementType,
      quantity: activity.quantity,
      previousQuantity: activity.previousQuantity,
      newQuantity: activity.newQuantity,
      branch: activity.branchId?.name || 'Unknown Branch',
      reason: activity.reason,
      notes: activity.notes
    }));

    res.status(200).json({
      success: true,
      data: {
        item: {
          id: item._id,
          name: item.name,
          category: item.category,
          code: item.itemCode,
          currentStock: item.openingQty,
          minStock: item.minStock,
          price: item.price,
          expiryDate: item.expiryDate,
          branch: item.branchId,
          createdAt: item.createdAt
        },
        statistics: stats,
        timeline: timeline
      }
    });

  } catch (error) {
    console.error("Get Item Activity Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch item activity",
      error: error.message
    });
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Convert timestamp to human-readable "time ago" format
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}