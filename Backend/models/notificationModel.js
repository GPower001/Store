// import mongoose from "mongoose";

// const notificationSchema = new mongoose.Schema(
//   {
//     type: { type: String, enum: ["low-stock", "expired"], required: true },
//     message: { type: String, required: true },
//     item: { type: String, required: true },
//     count: { type: Number, default: null },
//     isRead: { type: Boolean, default: false },
//     branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true }, // ✅ new
//     createdAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// notificationSchema.index({ branchId: 1 });

// export default mongoose.model("Notification", notificationSchema);


import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ["low-stock", "expired", "expiring-soon", "out-of-stock"], 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    item: { 
      type: String, 
      required: true 
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item"
    },
    count: { 
      type: Number, 
      default: null 
    },
    isRead: { 
      type: Boolean, 
      default: false 
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true
    },
    branchId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Branch", 
      required: true 
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ tenantId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ branchId: 1, isRead: 1 });

export default mongoose.model("Notification", notificationSchema);