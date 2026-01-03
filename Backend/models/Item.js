// import mongoose from "mongoose";

// const itemSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     category: { type: String, required: true },
//     openingQty: { type: Number, required: true },
//     minStock: { type: Number, required: true },
//     itemCode: { type: String, required: true }, // remove global unique
//     price: { type: Number },
//     imageUrl: { type: String },
//     expiryDate: { type: Date },
//     branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
//   },
//   { timestamps: true }
// );

// // ✅ Ensure uniqueness per branch for (name + category)
// itemSchema.index({ name: 1, category: 1, branchId: 1 }, { unique: true });

// // ✅ Compound index: itemCode must be unique only within a branch
// itemSchema.index({ itemCode: 1, branchId: 1 }, { unique: true });

// // ✅ Index for branch queries (optional, good for performance)
// itemSchema.index({ branchId: 1 });

// const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);
// export default Item;


import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    category: { 
      type: String, 
      required: true,
      trim: true
    },
    openingQty: { 
      type: Number, 
      required: true,
      min: 0
    },
    minStock: { 
      type: Number, 
      required: true,
      min: 0
    },
    itemCode: { 
      type: String, 
      required: true,
      trim: true
    },
    price: { 
      type: Number,
      min: 0
    },
    image: { 
      type: String 
    },
    expiryDate: { 
      type: Date 
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
    // Additional fields
    description: { type: String },
    unit: { type: String }, // e.g., "pcs", "kg", "liters"
  },
  { timestamps: true }
);

// Indexes - Items must be unique per tenant and branch
itemSchema.index({ name: 1, category: 1, branchId: 1, tenantId: 1 }, { unique: true });
itemSchema.index({ itemCode: 1, branchId: 1, tenantId: 1 }, { unique: true });
itemSchema.index({ tenantId: 1 });
itemSchema.index({ branchId: 1 });
itemSchema.index({ category: 1, tenantId: 1 });

const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);
export default Item;