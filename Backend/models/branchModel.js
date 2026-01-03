// import mongoose from "mongoose";

// const branchSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     location: { type: String },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Branch", branchSchema);



import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    location: { 
      type: String,
      trim: true
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Additional branch details
    address: { type: String },
    phone: { type: String },
    managerName: { type: String },
  },
  { timestamps: true }
);

// Indexes - Branch names must be unique per tenant
branchSchema.index({ name: 1, tenantId: 1 }, { unique: true });
branchSchema.index({ tenantId: 1 });

export default mongoose.model("Branch", branchSchema);