// import express from "express";
// import Notification from "../models/notificationModel.js";

// const router = express.Router();

// // Get all notifications
// router.get("/", async (req, res) => {
//   try {
//     const notifications = await Notification.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, data: notifications });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error fetching notifications", error: error.message });
//   }
// });


// // Mark a notification as read
// router.patch("/:id/read", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const notification = await Notification.findByIdAndUpdate(
//       id,
//       { isRead: true },
//       { new: true }
//     );

//     if (!notification) {
//       return res.status(404).json({ success: false, message: "Notification not found" });
//     }

//     res.status(200).json({ success: true, data: notification });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error updating notification", error: error.message });
//   }
// });

// // Update an item
// router.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedItem = await Item.findByIdAndUpdate(id, req.body, { new: true });

//     if (!updatedItem) {
//       return res.status(404).json({ success: false, message: "Item not found" });
//     }

//     // Trigger low stock check after updating the item
//     await checkLowStock();

//     res.status(200).json({ success: true, data: updatedItem });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error updating item", error: error.message });
//   }
// });

// export default router;

import express from "express";
import Notification from "../models/notificationModel.js";

const router = express.Router();

// Get all notifications (only low-stock and expired, unread first)
router.get("/", async (req, res) => {
  try {
    // Only get low-stock and expired notifications, unread first
    const notifications = await Notification.find({
      type: { $in: ["expired", "low-stock"] }
    })
      .sort({ isRead: 1, createdAt: -1 }); // Unread first, then newest

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching notifications", error: error.message });
  }
});

// Mark a notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating notification", error: error.message });
  }
});

export default router;

// import express from "express";
// import Notification from "../models/notificationModel.js";
// import { io } from "../server.js"; // import Socket.IO instance

// const router = express.Router();

// // Get all notifications for a branch (only low-stock and expired, unread first)
// router.get("/", async (req, res) => {
//   try {
//     const { branchId } = req.query;

//     if (!branchId) {
//       return res.status(400).json({ success: false, message: "branchId is required" });
//     }

//     const notifications = await Notification.find({
//       branchId,
//       type: { $in: ["expired", "low-stock"] }
//     }).sort({ isRead: 1, createdAt: -1 });

//     res.status(200).json({ success: true, data: notifications });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching notifications",
//       error: error.message,
//     });
//   }
// });

// // Mark a notification as read (must belong to branch)
// router.patch("/:id/read", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { branchId } = req.body;

//     if (!branchId) {
//       return res.status(400).json({ success: false, message: "branchId is required" });
//     }

//     const notification = await Notification.findOneAndUpdate(
//       { _id: id, branchId },
//       { isRead: true },
//       { new: true }
//     );

//     if (!notification) {
//       return res.status(404).json({ success: false, message: "Notification not found for this branch" });
//     }

//     // Emit real-time update so frontend can remove or update notification
//     io.emit("notification-read", { id, branchId });

//     res.status(200).json({ success: true, data: notification });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error updating notification",
//       error: error.message,
//     });
//   }
// });

// export default router;

