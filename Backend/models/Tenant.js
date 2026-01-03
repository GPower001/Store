import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    companyName: { 
      type: String, 
      required: true,
      trim: true
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    subdomain: { 
      type: String, 
      unique: true,
      lowercase: true,
      trim: true
    },
    subscriptionTier: { 
      type: String, 
      enum: ["free", "basic", "premium"], 
      default: "free" 
    },
    status: { 
      type: String, 
      enum: ["active", "suspended", "cancelled"], 
      default: "active" 
    },
    // Subscription limits
    maxBranches: { type: Number, default: 5 },
    maxUsers: { type: Number, default: 10 },
    maxItems: { type: Number, default: 1000 },
    
    // Billing info (optional for now)
    billingEmail: { type: String },
    phone: { type: String },
    address: { type: String },
    
    // Subscription dates
    subscriptionStartDate: { type: Date, default: Date.now },
    subscriptionEndDate: { type: Date },
    trialEndsAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
tenantSchema.index({ email: 1 });
tenantSchema.index({ subdomain: 1 });
tenantSchema.index({ status: 1 });

export default mongoose.model("Tenant", tenantSchema);