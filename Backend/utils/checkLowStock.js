// import Notification from "../models/notificationModel.js";
// import Item from "../models/Item.js";

// const checkLowStock = async (io, itemId = null) => {
//   try {
//     let lowStockItems;

//     if (itemId) {
//       const item = await Item.findById(itemId);
//       lowStockItems = item && item.openingQty <= item.minStock ? [item] : [];
//     } else {
//       lowStockItems = await Item.find({
//         $expr: { $lte: ["$openingQty", "$minStock"] },
//       });
//     }

//     console.log("Low Stock Items:", lowStockItems);

//     for (const item of lowStockItems) {
//       // Check for existing low-stock notification
//       const existingNotification = await Notification.findOne({ item: item.name, type: "low-stock" });

//       if (existingNotification) {
//         if (existingNotification.isRead) {
//           existingNotification.isRead = false;
//           existingNotification.message = `${item.name} is running low (${item.openingQty} units left)`;
//           existingNotification.count = item.openingQty;
//           await existingNotification.save();

//           // Emit to the specific branch room
//           io.to(item.branchId.toString()).emit("new-notification", existingNotification);
//         }
//       } else {
//         const notification = await Notification.create({
//           type: "low-stock",
//           message: `${item.name} is running low (${item.openingQty} units left)`,
//           item: item.name,
//           count: item.openingQty,
//           branchId: item.branchId, // ensure branchId is stored
//         });

//         // Emit to the specific branch room
//         io.to(item.branchId.toString()).emit("new-notification", notification);
//       }
//     }
//   } catch (error) {
//     console.error("Error checking low stock:", error.message);
//   }
// };

// export default checkLowStock;


import Notification from "../models/notificationModel.js";
import Item from "../models/Item.js";

const lastTenantChecks = new Map();
const CHECK_COOLDOWN_MS = 5000;

/**
 * Check for low stock items and create/update notifications
 * @param {Object} io - Socket.io instance
 * @param {String} itemId - Optional: Check specific item only
 */
const checkLowStock = (io) => async (itemId = null, tenantId = null) => {  // ✅ Curry function to match server.js usage
  try {
    if (!itemId && tenantId) {
      const lastCheck = lastTenantChecks.get(String(tenantId)) || 0;
      if (Date.now() - lastCheck < CHECK_COOLDOWN_MS) return;
      lastTenantChecks.set(String(tenantId), Date.now());
    }
    console.log("🔍 Checking for low stock items...");
    
    let lowStockItems;

    if (itemId) {
      // Check specific item
      const item = await Item.findById(itemId);
      lowStockItems = item && item.openingQty <= item.minStock ? [item] : [];
    } else {
      // Check all items with low stock
      lowStockItems = await Item.find({
        ...(tenantId ? { tenantId } : {}),
        isDeleted: false,
        $expr: { $lte: ["$openingQty", "$minStock"] },
      });
    }

    console.log(`📊 Low Stock Items Found: ${lowStockItems.length}`);

    if (lowStockItems.length === 0) {
      console.log("✅ All items are adequately stocked!");
      return;
    }

    let notificationsProcessed = 0;

    for (const item of lowStockItems) {
      // ✅ Multi-tenant: Check for existing notification per tenant and branch
      const existingNotification = await Notification.findOne({ 
        itemId: item._id,
        type: "low-stock",
        tenantId: item.tenantId,  // ✅ Filter by tenant
        branchId: item.branchId   // ✅ Filter by branch
      });

      if (existingNotification) {
        // Update existing notification if it was read
        if (existingNotification.isRead) {
          existingNotification.isRead = false;
          existingNotification.message = `${item.name} is running low (${item.openingQty} units left)`;
          existingNotification.count = item.openingQty;
          existingNotification.priority = item.openingQty === 0 ? "critical" : "high";
          await existingNotification.save();

          console.log(`🔄 Updated notification for: ${item.name}`);

          // Emit to the specific branch room
          if (io && item.branchId) {
            io.to(item.branchId.toString()).emit("new-notification", existingNotification);
          }
          
          notificationsProcessed++;
        }
      } else {
        // Create new notification
        const notification = await Notification.create({
          type: "low-stock",
          message: `${item.name} is running low (${item.openingQty} units left)`,
          item: item.name,
          itemId: item._id,
          count: item.openingQty,
          tenantId: item.tenantId,  // ✅ Include tenant
          branchId: item.branchId,  // ✅ Include branch
          priority: item.openingQty === 0 ? "critical" : "high",
          isRead: false,
        });

        console.log(`✅ Created notification for: ${item.name} (${item.openingQty}/${item.minStock})`);

        // Emit to the specific branch room
        if (io && item.branchId) {
          io.to(item.branchId.toString()).emit("new-notification", notification);
        }
        
        notificationsProcessed++;
      }
    }

    console.log(`✅ Low stock check complete. Processed ${notificationsProcessed} notifications.`);
  } catch (error) {
    console.error("❌ Error checking low stock:", error.message);
    throw error;
  }
};

export default checkLowStock;