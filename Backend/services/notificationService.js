// import Notification from "../models/notificationModel.js";

// const createNotification = async (notificationData) => {
//   try {
//     const notification = new Notification(notificationData);
//     await notification.save();
//     return notification;
//   } catch (error) {
//     throw new Error("Error creating notification: " + error.message);
//   }
// };

// const getAllNotifications = async () => {
//   try {
//     const notifications = await Notification.find().sort({ createdAt: -1 });
//     return notifications;
//   } catch (error) {
//     throw new Error("Error fetching notifications: " + error.message);
//   }
// };

// const deleteNotification = async (notificationId) => {
//   try {
//     const result = await Notification.findByIdAndDelete(notificationId);
//     if (!result) {
//       throw new Error("Notification not found");
//     }
//     return result;
//   } catch (error) {
//     throw new Error("Error deleting notification: " + error.message);
//   }
// };

// export default {
//   createNotification,
//   getAllNotifications,
//   deleteNotification,
// };


// import Notification from "../models/notificationModel.js";

// // Create a new notification
// const createNotification = async (notificationData) => {
//   try {
//     // Validate notification data (optional, based on your schema)
//     if (!notificationData || !notificationData.message) {
//       throw new Error("Notification data is invalid or missing required fields");
//     }

//     const notification = new Notification(notificationData);
//     await notification.save();
//     return notification;
//   } catch (error) {
//     console.error("Error creating notification:", error.message); // Log the error
//     throw new Error("Error creating notification: " + error.message);
//   }
// };

// // Retrieve all notifications
// const getAllNotifications = async () => {
//   try {
//     const notifications = await Notification.find().sort({ createdAt: -1 });
//     return notifications;
//   } catch (error) {
//     console.error("Error fetching notifications:", error.message); // Log the error
//     throw new Error("Error fetching notifications: " + error.message);
//   }
// };

// // Delete a notification by ID
// const deleteNotification = async (notificationId) => {
//   try {
//     // Validate the notification ID
//     if (!notificationId) {
//       throw new Error("Notification ID is required");
//     }

//     const result = await Notification.findByIdAndDelete(notificationId);
//     if (!result) {
//       throw new Error("Notification not found");
//     }
//     return result;
//   } catch (error) {
//     console.error("Error deleting notification:", error.message); // Log the error
//     throw new Error("Error deleting notification: " + error.message);
//   }
// };

// export default {
//   createNotification,
//   getAllNotifications,
//   deleteNotification,
// };

import Notification from "../models/notificationModel.js";
import { io } from "../socket.js";
import mongoose from "mongoose";

// Utility function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Utility function to safely emit socket events
const safeEmit = (room, event, data) => {
  try {
    io.to(room).emit(event, data);
    console.log(`Emitted ${event} to room: ${room}`);
    return true;
  } catch (error) {
    console.error(`Failed to emit ${event} to room ${room}:`, error.message);
    return false;
  }
};

// Create a new notification and emit via socket
const createNotification = async (notificationData) => {
  try {
    // Enhanced validation
    if (!notificationData) {
      throw new Error("Notification data is required");
    }

    const { message, branchId, type, item } = notificationData;

    if (!message || !branchId) {
      throw new Error("Message and branchId are required fields");
    }

    if (!isValidObjectId(branchId)) {
      throw new Error("Invalid branchId format");
    }

    // Check for duplicate notifications (optional - based on your business logic)
    if (type && item) {
      const existingNotification = await Notification.findOne({
        branchId,
        type,
        item,
        isRead: false
      });

      if (existingNotification) {
        console.log(`Duplicate notification prevented for item: ${item}, type: ${type}`);
        return existingNotification;
      }
    }

    const notification = new Notification({
      ...notificationData,
      createdAt: new Date(),
      isRead: false // Ensure new notifications are unread
    });
    
    await notification.save();

    // Emit notification to branch-specific room with error handling
    safeEmit(branchId.toString(), "new-notification", notification);

    console.log(`Notification created: ${notification._id} for branch: ${branchId}`);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error.message);
    throw new Error(`Error creating notification: ${error.message}`);
  }
};

// Retrieve notifications for a branch with filtering options
const getAllNotifications = async (branchId, options = {}) => {
  try {
    if (!branchId) {
      throw new Error("branchId is required to fetch notifications");
    }

    if (!isValidObjectId(branchId)) {
      throw new Error("Invalid branchId format");
    }

    // Build query with optional filters
    const query = { branchId };
    
    if (options.isRead !== undefined) {
      query.isRead = options.isRead;
    }

    if (options.type) {
      query.type = options.type;
    }

    if (options.dateFrom || options.dateTo) {
      query.createdAt = {};
      if (options.dateFrom) {
        query.createdAt.$gte = new Date(options.dateFrom);
      }
      if (options.dateTo) {
        query.createdAt.$lte = new Date(options.dateTo);
      }
    }

    // Build sort options
    const sort = {};
    if (options.sortBy) {
      sort[options.sortBy] = options.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default: newest first
    }

    // Handle pagination
    const limit = options.limit ? parseInt(options.limit) : 50;
    const skip = options.page ? (parseInt(options.page) - 1) * limit : 0;

    const notifications = await Notification.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean(); // Use lean() for better performance if you don't need full mongoose documents

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    return {
      notifications,
      pagination: {
        total,
        page: options.page ? parseInt(options.page) : 1,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    throw new Error(`Error fetching notifications: ${error.message}`);
  }
};

// Update notification (mark as read/unread)
const updateNotification = async (notificationId, branchId, updates) => {
  try {
    if (!notificationId || !branchId) {
      throw new Error("Notification ID and branchId are required");
    }

    if (!isValidObjectId(notificationId) || !isValidObjectId(branchId)) {
      throw new Error("Invalid notification ID or branchId format");
    }

    // Only allow specific fields to be updated
    const allowedUpdates = ['isRead', 'message', 'count'];
    const updateData = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      throw new Error("No valid update fields provided");
    }

    updateData.updatedAt = new Date();

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, branchId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!notification) {
      throw new Error("Notification not found or does not belong to this branch");
    }

    // Emit update event
    safeEmit(branchId.toString(), "notification-updated", notification);

    console.log(`Notification updated: ${notificationId}`);
    return notification;
  } catch (error) {
    console.error("Error updating notification:", error.message);
    throw new Error(`Error updating notification: ${error.message}`);
  }
};

// Mark notification as read
const markAsRead = async (notificationId, branchId) => {
  return updateNotification(notificationId, branchId, { isRead: true });
};

// Mark notification as unread
const markAsUnread = async (notificationId, branchId) => {
  return updateNotification(notificationId, branchId, { isRead: false });
};

// Mark all notifications as read for a branch
const markAllAsRead = async (branchId, type = null) => {
  try {
    if (!branchId) {
      throw new Error("branchId is required");
    }

    if (!isValidObjectId(branchId)) {
      throw new Error("Invalid branchId format");
    }

    const query = { branchId, isRead: false };
    if (type) {
      query.type = type;
    }

    const result = await Notification.updateMany(
      query,
      { 
        isRead: true, 
        updatedAt: new Date() 
      }
    );

    // Emit batch update event
    safeEmit(branchId.toString(), "notifications-bulk-updated", {
      action: "mark-all-read",
      count: result.modifiedCount,
      type
    });

    console.log(`Marked ${result.modifiedCount} notifications as read for branch: ${branchId}`);
    return result;
  } catch (error) {
    console.error("Error marking all notifications as read:", error.message);
    throw new Error(`Error marking all notifications as read: ${error.message}`);
  }
};

// Delete a notification by ID
const deleteNotification = async (notificationId, branchId) => {
  try {
    if (!notificationId || !branchId) {
      throw new Error("Notification ID and branchId are required");
    }

    if (!isValidObjectId(notificationId) || !isValidObjectId(branchId)) {
      throw new Error("Invalid notification ID or branchId format");
    }

    const result = await Notification.findOneAndDelete({ 
      _id: notificationId, 
      branchId 
    });

    if (!result) {
      throw new Error("Notification not found or does not belong to this branch");
    }

    // Emit deletion event
    safeEmit(branchId.toString(), "notification-deleted", {
      notificationId,
      deletedNotification: result
    });

    console.log(`Notification deleted: ${notificationId}`);
    return result;
  } catch (error) {
    console.error("Error deleting notification:", error.message);
    throw new Error(`Error deleting notification: ${error.message}`);
  }
};

// Delete multiple notifications
const deleteMultipleNotifications = async (notificationIds, branchId) => {
  try {
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      throw new Error("Array of notification IDs is required");
    }

    if (!branchId || !isValidObjectId(branchId)) {
      throw new Error("Valid branchId is required");
    }

    // Validate all IDs
    const invalidIds = notificationIds.filter(id => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      throw new Error(`Invalid notification IDs: ${invalidIds.join(', ')}`);
    }

    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
      branchId
    });

    // Emit bulk deletion event
    safeEmit(branchId.toString(), "notifications-bulk-deleted", {
      deletedCount: result.deletedCount,
      requestedIds: notificationIds
    });

    console.log(`Deleted ${result.deletedCount} notifications for branch: ${branchId}`);
    return result;
  } catch (error) {
    console.error("Error deleting multiple notifications:", error.message);
    throw new Error(`Error deleting multiple notifications: ${error.message}`);
  }
};

// Get unread count for a branch
const getUnreadCount = async (branchId, type = null) => {
  try {
    if (!branchId || !isValidObjectId(branchId)) {
      throw new Error("Valid branchId is required");
    }

    const query = { branchId, isRead: false };
    if (type) {
      query.type = type;
    }

    const count = await Notification.countDocuments(query);
    return count;
  } catch (error) {
    console.error("Error getting unread count:", error.message);
    throw new Error(`Error getting unread count: ${error.message}`);
  }
};

// Clean up old notifications (utility function)
const cleanupOldNotifications = async (daysOld = 30, branchId = null) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const query = { 
      createdAt: { $lt: cutoffDate },
      isRead: true // Only delete read notifications
    };

    if (branchId) {
      if (!isValidObjectId(branchId)) {
        throw new Error("Invalid branchId format");
      }
      query.branchId = branchId;
    }

    const result = await Notification.deleteMany(query);
    console.log(`Cleaned up ${result.deletedCount} old notifications`);
    return result;
  } catch (error) {
    console.error("Error cleaning up old notifications:", error.message);
    throw new Error(`Error cleaning up old notifications: ${error.message}`);
  }
};

export default {
  createNotification,
  getAllNotifications,
  updateNotification,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  getUnreadCount,
  cleanupOldNotifications,
};