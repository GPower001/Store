// import mongoose from "mongoose";

// const stockMovementSchema = new mongoose.Schema(
//   {
//     itemId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Item",
//       required: true,
//     },
//     branchId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Branch",
//       required: true,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     movementType: {
//       type: String,
//       enum: ["addition", "removal", "adjustment"],
//       required: true,
//     },
//     quantity: {
//       type: Number,
//       required: true,
//     },
//     previousQuantity: {
//       type: Number,
//       required: true,
//     },
//     newQuantity: {
//       type: Number,
//       required: true,
//     },
//     reason: {
//       type: String,
//       default: "",
//     },
//     notes: {
//       type: String,
//       default: "",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Indexes for better query performance
// stockMovementSchema.index({ branchId: 1, createdAt: -1 });
// stockMovementSchema.index({ userId: 1, createdAt: -1 });
// stockMovementSchema.index({ itemId: 1, createdAt: -1 });
// stockMovementSchema.index({ movementType: 1, createdAt: -1 });

// const StockMovement = mongoose.model("StockMovement", stockMovementSchema);

// export default StockMovement;


import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movementType: {
      type: String,
      enum: ["addition", "removal", "adjustment", "transfer"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    // For transfers between branches
    fromBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    toBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
stockMovementSchema.index({ tenantId: 1, createdAt: -1 });
stockMovementSchema.index({ branchId: 1, createdAt: -1 });
stockMovementSchema.index({ userId: 1, createdAt: -1 });
stockMovementSchema.index({ itemId: 1, createdAt: -1 });
stockMovementSchema.index({ movementType: 1, createdAt: -1 });

const StockMovement = mongoose.model("StockMovement", stockMovementSchema);

export default StockMovement;