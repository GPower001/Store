import AuditLog from "../models/AuditLog.js";

/**
 * @desc Get audit logs with filters
 * @route GET /api/audit/logs
 * @access Private/Admin
 */
export const getAuditLogs = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const {
      userId,
      action,
      resource,
      severity,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    // Build filter
    const filter = { tenantId };

    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(filter);

    // Get logs
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error("Get Audit Logs Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message
    });
  }
};

/**
 * @desc Get audit log statistics
 * @route GET /api/audit/stats
 * @access Private/Admin
 */
export const getAuditStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get stats
    const stats = await AuditLog.aggregate([
      {
        $match: {
          tenantId: tenantId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byAction: {
            $push: "$action"
          },
          byResource: {
            $push: "$resource"
          },
          bySeverity: {
            $push: "$severity"
          },
          failures: {
            $sum: { $cond: [{ $eq: ["$status", "failure"] }, 1, 0] }
          },
          criticalEvents: {
            $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        total: 0,
        failures: 0,
        criticalEvents: 0
      }
    });
  } catch (error) {
    console.error("Get Audit Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit statistics",
      error: error.message
    });
  }
};

/**
 * @desc Get user's audit trail
 * @route GET /api/audit/users/:userId
 * @access Private/Admin
 */
export const getUserAuditTrail = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { userId } = req.params;
    const { days = 30, limit = 100 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await AuditLog.find({
      tenantId,
      userId,
      createdAt: { $gte: startDate }
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: {
        userId,
        logs,
        total: logs.length
      }
    });
  } catch (error) {
    console.error("Get User Audit Trail Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user audit trail",
      error: error.message
    });
  }
};

/**
 * @desc Search audit logs
 * @route GET /api/audit/search
 * @access Private/Admin
 */
export const searchAuditLogs = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { query, limit = 50 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    // Search in description, userName, userEmail, resourceName
    const logs = await AuditLog.find({
      tenantId,
      $or: [
        { description: { $regex: query, $options: 'i' } },
        { userName: { $regex: query, $options: 'i' } },
        { userEmail: { $regex: query, $options: 'i' } },
        { resourceName: { $regex: query, $options: 'i' } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: {
        query,
        results: logs,
        total: logs.length
      }
    });
  } catch (error) {
    console.error("Search Audit Logs Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search audit logs",
      error: error.message
    });
  }
};