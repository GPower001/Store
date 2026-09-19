// import mongoose from "mongoose";

// const tenantSchema = new mongoose.Schema(
//   {
//     companyName: { 
//       type: String, 
//       required: true,
//       trim: true
//     },
//     email: { 
//       type: String, 
//       required: true, 
//       unique: true,
//       lowercase: true,
//       trim: true
//     },
//     subdomain: { 
//       type: String, 
//       unique: true,
//       lowercase: true,
//       trim: true
//     },
//     subscriptionTier: { 
//       type: String, 
//       enum: ["free", "basic", "premium"], 
//       default: "free" 
//     },
//     status: { 
//       type: String, 
//       enum: ["active", "suspended", "cancelled"], 
//       default: "active" 
//     },
//     // Subscription limits
//     maxBranches: { type: Number, default: 5 },
//     maxUsers: { type: Number, default: 10 },
//     maxItems: { type: Number, default: 1000 },
    
//     // Billing info (optional for now)
//     billingEmail: { type: String },
//     phone: { type: String },
//     address: { type: String },
    
//     // Subscription dates
//     subscriptionStartDate: { type: Date, default: Date.now },
//     subscriptionEndDate: { type: Date },
//     trialEndsAt: { type: Date },
//   },
//   { timestamps: true }
// );

// // Indexes
// tenantSchema.index({ email: 1 });
// tenantSchema.index({ subdomain: 1 });
// tenantSchema.index({ status: 1 });

// export default mongoose.model("Tenant", tenantSchema);


// import mongoose from "mongoose";

// const tenantSchema = new mongoose.Schema(
//   {
//     companyName: { 
//       type: String, 
//       required: true,
//       trim: true
//     },
//     email: { 
//       type: String, 
//       required: true, 
//       unique: true,       
//       lowercase: true,
//       trim: true
//     },
//     subdomain: { 
//       type: String, 
//       unique: true,       
//       lowercase: true,
//       trim: true
//     },
//     subscriptionTier: { 
//       type: String, 
//       enum: ["free", "basic", "premium"], 
//       default: "free" 
//     },
//     status: { 
//       type: String, 
//       enum: ["active", "suspended", "cancelled"], 
//       default: "active" 
//     },
//     maxBranches: { type: Number, default: 5 },
//     maxUsers: { type: Number, default: 10 },
//     maxItems: { type: Number, default: 1000 },
//     billingEmail: { type: String },
//     phone: { type: String },
//     address: { type: String },
//     subscriptionStartDate: { type: Date, default: Date.now },
//     subscriptionEndDate: { type: Date },
//     trialEndsAt: { type: Date },
//   },
//   { timestamps: true }
// );

// tenantSchema.index({ status: 1 });

// export default mongoose.model("Tenant", tenantSchema);

import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    companyName: { 
      type: String, 
      required: true,
      trim: true
    },
    industry: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    referralCode: {
      type: String,
      trim: true,
      default: ""
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
      enum: ["active", "suspended", "cancelled", "trial"], 
      default: "trial" // Start as trial instead of active
    },
    
    // ✅ UPDATED: Separate limits for admins and staff
    maxBranches: { type: Number, default: 1 },
    maxAdmins: { type: Number, default: 1 },
    maxStaff: { type: Number, default: 1 }, // Staff members (non-admin)
    maxItems: { type: Number, default: 100 },
    
    // ✅ NEW: Track additional paid staff
    additionalStaff: { 
      type: Number, 
      default: 0 // Number of staff beyond base plan
    },
    
    // ✅ NEW: Calculate monthly staff cost
    monthlyStaffCost: {
      type: Number,
      default: 0 // Additional cost for extra staff
    },
    
    billingEmail: { type: String },
    phone: { type: String },
    address: { type: String },
    currency: { type: String, default: "NGN", trim: true },
    region: { type: String, default: "NG", trim: true },
    notificationPreferences: {
      lowStockAlerts: { type: Boolean, default: true },
      overdueInvoiceAlerts: { type: Boolean, default: true },
      expiryAlerts: { type: Boolean, default: true },
      gettingStartedEmails: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      dailySummary: { type: Boolean, default: true },
    },
    
    // ✅ UPDATED: Trial period tracking
    trialStartDate: { type: Date, default: Date.now },
    trialEndsAt: { 
      type: Date,
      default: function() {
        // Set trial to end 30 days from now
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      }
    },
    
    subscriptionStartDate: { type: Date },
    subscriptionEndDate: { type: Date },
  },
  { timestamps: true }
);

// ✅ NEW: Method to check if trial is active
tenantSchema.methods.isTrialActive = function() {
  const now = new Date();
  return this.status === "trial" && this.trialEndsAt > now;
};

// NEW: Method to check if trial has expired
tenantSchema.methods.hasTrialExpired = function() {
  const now = new Date();
  return this.status === "trial" && this.trialEndsAt <= now;
};

// NEW: Calculate total allowed users
tenantSchema.methods.getTotalAllowedUsers = function() {
  return this.maxAdmins + this.maxStaff + this.additionalStaff;
};

// NEW: Calculate monthly cost including additional staff
tenantSchema.methods.calculateMonthlyCost = function() {
  const basePrices = { free: 0, basic: 10000, premium: 25000 };
  const staffPrices = { free: 0, basic: 5, premium: 4 };
  return (basePrices[this.subscriptionTier] || 0) + (this.additionalStaff * (staffPrices[this.subscriptionTier] || 0));
};

tenantSchema.index({ status: 1 });

export default mongoose.model("Tenant", tenantSchema);