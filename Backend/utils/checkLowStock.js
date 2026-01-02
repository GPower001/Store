import Notification from "../models/notificationModel.js";
import Item from "../models/Item.js";

const checkLowStock = async (io, itemId = null) => {
  try {
    let lowStockItems;

    if (itemId) {
      const item = await Item.findById(itemId);
      lowStockItems = item && item.openingQty <= item.minStock ? [item] : [];
    } else {
      lowStockItems = await Item.find({
        $expr: { $lte: ["$openingQty", "$minStock"] },
      });
    }

    console.log("Low Stock Items:", lowStockItems);

    for (const item of lowStockItems) {
      // Check for existing low-stock notification
      const existingNotification = await Notification.findOne({ item: item.name, type: "low-stock" });

      if (existingNotification) {
        if (existingNotification.isRead) {
          existingNotification.isRead = false;
          existingNotification.message = `${item.name} is running low (${item.openingQty} units left)`;
          existingNotification.count = item.openingQty;
          await existingNotification.save();

          // Emit to the specific branch room
          io.to(item.branchId.toString()).emit("new-notification", existingNotification);
        }
      } else {
        const notification = await Notification.create({
          type: "low-stock",
          message: `${item.name} is running low (${item.openingQty} units left)`,
          item: item.name,
          count: item.openingQty,
          branchId: item.branchId, // ensure branchId is stored
        });

        // Emit to the specific branch room
        io.to(item.branchId.toString()).emit("new-notification", notification);
      }
    }
  } catch (error) {
    console.error("Error checking low stock:", error.message);
  }
};

export default checkLowStock;
