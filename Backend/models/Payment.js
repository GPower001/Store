import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reference: { type: String, required: true, unique: true, index: true },
    tier: { type: String, enum: ["free", "basic", "premium"], required: true },
    paymentType: { type: String, enum: ["subscription", "staff-slots"], default: "subscription" },
    staffSlots: { type: Number, min: 0, default: 0 },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NGN" },
    status: { type: String, enum: ["initialized", "success", "failed"], default: "initialized" },
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
