import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    name: { type: String, required: true },
    itemCode: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [saleItemSchema], required: true, validate: (items) => items.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["cash", "card", "transfer"], required: true },
    status: { type: String, enum: ["completed", "voided"], default: "completed" },
  },
  { timestamps: true }
);

saleSchema.index({ tenantId: 1, branchId: 1, createdAt: -1 });

export default mongoose.models.Sale || mongoose.model("Sale", saleSchema);
