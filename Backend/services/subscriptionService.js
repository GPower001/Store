// import Tenant from "../models/Tenant.js";
// import User from "../models/userModel.js";
// import Branch from "../models/branchModel.js";
// import Item from "../models/Item.js";
// import { SUBSCRIPTION_PLANS } from "../config/subscriptionPlans.js";

// /**
//  * Get current resource usage for a tenant
//  * This tells us how many users, branches, items they're using
//  */
// export const getTenantUsage = async (tenantId) => {
//   const [userCount, branchCount, itemCount] = await Promise.all([
//     User.countDocuments({ tenantId }),
//     Branch.countDocuments({ tenantId }),
//     Item.countDocuments({ tenantId })
//   ]);

//   return {
//     users: userCount,
//     branches: branchCount,
//     items: itemCount
//   };
// };

// /**
//  * Calculate usage percentage for each resource
//  * Helps show "You're using 8 out of 10 users (80%)"
//  */
// export const calculateUsagePercentages = (usage, limits) => {
//   return {
//     users: {
//       current: usage.users,
//       limit: limits.maxUsers,
//       percentage: Math.round((usage.users / limits.maxUsers) * 100),
//       available: Math.max(0, limits.maxUsers - usage.users)
//     },
//     branches: {
//       current: usage.branches,
//       limit: limits.maxBranches,
//       percentage: Math.round((usage.branches / limits.maxBranches) * 100),
//       available: Math.max(0, limits.maxBranches - usage.branches)
//     },
//     items: {
//       current: usage.items,
//       limit: limits.maxItems,
//       percentage: Math.round((usage.items / limits.maxItems) * 100),
//       available: Math.max(0, limits.maxItems - usage.items)
//     }
//   };
// };

// /**
//  * Check if tenant has exceeded any limits
//  * Returns true if they've hit the ceiling on any resource
//  */
// export const hasExceededLimits = async (tenantId, resourceType = null) => {
//   const tenant = await Tenant.findById(tenantId);
//   if (!tenant) {
//     throw new Error("Tenant not found");
//   }

//   const usage = await getTenantUsage(tenantId);

//   // Check specific resource if provided
//   if (resourceType) {
//     const resourceMap = {
//       users: { current: usage.users, max: tenant.maxUsers },
//       branches: { current: usage.branches, max: tenant.maxBranches },
//       items: { current: usage.items, max: tenant.maxItems }
//     };

//     const resource = resourceMap[resourceType];
//     return resource.current >= resource.max;
//   }

//   // Check all resources
//   return (
//     usage.users >= tenant.maxUsers ||
//     usage.branches >= tenant.maxBranches ||
//     usage.items >= tenant.maxItems
//   );
// };

// /**
//  * Calculate days until subscription renewal
//  * Shows: "Your subscription renews in 15 days"
//  */
// export const calculateDaysUntilRenewal = (subscriptionEndDate) => {
//   if (!subscriptionEndDate) return null;
  
//   const now = new Date();
//   const endDate = new Date(subscriptionEndDate);
//   const diffTime = endDate - now;
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
//   return Math.max(0, diffDays);
// };

// /**
//  * Validate if upgrade is allowed
//  * Prevents downgrading or invalid tier changes
//  */
// export const validateSubscriptionUpgrade = (currentTier, newTier) => {
//   const tierOrder = { free: 0, basic: 1, premium: 2 };
  
//   if (!tierOrder.hasOwnProperty(newTier)) {
//     return { valid: false, message: "Invalid subscription tier" };
//   }
  
//   if (tierOrder[newTier] <= tierOrder[currentTier]) {
//     return { 
//       valid: false, 
//       message: "Cannot downgrade or stay on same tier using upgrade" 
//     };
//   }
  
//   return { valid: true };
// };

// /**
//  * Update tenant subscription limits based on new plan
//  * This is called after successful payment
//  */
// export const updateTenantLimits = async (tenantId, newTier) => {
//   const tenant = await Tenant.findById(tenantId);
//   if (!tenant) {
//     throw new Error("Tenant not found");
//   }

//   const newPlan = SUBSCRIPTION_PLANS[newTier];
  
//   // Update subscription details
//   tenant.subscriptionTier = newTier;
//   tenant.maxBranches = newPlan.maxBranches;
//   tenant.maxUsers = newPlan.maxUsers;
//   tenant.maxItems = newPlan.maxItems;
//   tenant.status = "active";
  
//   // Set subscription dates (30 days from now)
//   const now = new Date();
//   tenant.subscriptionStartDate = now;
//   tenant.subscriptionEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
//   await tenant.save();
  
//   return tenant;
// };

// /**
//  * Process subscription cancellation
//  * Keeps access until end of billing period
//  */
// export const cancelTenantSubscription = async (tenantId, reason = null) => {
//   const tenant = await Tenant.findById(tenantId);
//   if (!tenant) {
//     throw new Error("Tenant not found");
//   }

//   tenant.status = "cancelled";
//   await tenant.save();

//   // Log cancellation for analytics
//   if (reason) {
//     console.log(`Tenant ${tenant.companyName} cancelled. Reason: ${reason}`);
//   }

//   return {
//     accessUntil: tenant.subscriptionEndDate,
//     tenant
//   };
// };

import Tenant from "../models/Tenant.js";
import User from "../models/userModel.js";
import Branch from "../models/branchModel.js";
import Item from "../models/Item.js";
import { SUBSCRIPTION_PLANS, ADDITIONAL_STAFF_PRICING } from "../config/subscriptionPlans.js";

/**
 * Get current resource usage for a tenant
 */
export const getTenantUsage = async (tenantId) => {
  // ✅ UPDATED: Count admins and staff separately
  const [adminCount, staffCount, branchCount, itemCount] = await Promise.all([
    User.countDocuments({ tenantId, role: "Admin" }),
    User.countDocuments({ tenantId, role: { $ne: "Admin" } }), // All non-admin users
    Branch.countDocuments({ tenantId }),
    Item.countDocuments({ tenantId })
  ]);

  return {
    admins: adminCount,
    staff: staffCount,
    totalUsers: adminCount + staffCount,
    branches: branchCount,
    items: itemCount
  };
};

/**
 * Calculate usage percentage for each resource
 */
export const calculateUsagePercentages = (usage, tenant) => {
  const totalAllowedStaff = tenant.maxStaff + tenant.additionalStaff;
  const totalAllowedUsers = tenant.maxAdmins + totalAllowedStaff;
  
  return {
    admins: {
      current: usage.admins,
      limit: tenant.maxAdmins,
      percentage: Math.round((usage.admins / tenant.maxAdmins) * 100),
      available: Math.max(0, tenant.maxAdmins - usage.admins)
    },
    staff: {
      current: usage.staff,
      limit: totalAllowedStaff,
      percentage: totalAllowedStaff > 0 ? Math.round((usage.staff / totalAllowedStaff) * 100) : 0,
      available: Math.max(0, totalAllowedStaff - usage.staff),
      base: tenant.maxStaff,
      additional: tenant.additionalStaff
    },
    totalUsers: {
      current: usage.totalUsers,
      limit: totalAllowedUsers,
      percentage: Math.round((usage.totalUsers / totalAllowedUsers) * 100),
      available: Math.max(0, totalAllowedUsers - usage.totalUsers)
    },
    branches: {
      current: usage.branches,
      limit: tenant.maxBranches,
      percentage: Math.round((usage.branches / tenant.maxBranches) * 100),
      available: Math.max(0, tenant.maxBranches - usage.branches)
    },
    items: {
      current: usage.items,
      limit: tenant.maxItems,
      percentage: Math.round((usage.items / tenant.maxItems) * 100),
      available: Math.max(0, tenant.maxItems - usage.items)
    }
  };
};

/**
 * ✅ NEW: Check if tenant can add a specific user role
 */
export const canAddUser = async (tenantId, role) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const usage = await getTenantUsage(tenantId);

  if (role === "Admin") {
    return {
      allowed: usage.admins < tenant.maxAdmins,
      current: usage.admins,
      limit: tenant.maxAdmins,
      message: usage.admins >= tenant.maxAdmins 
        ? "Admin limit reached. Upgrade your plan for more admins."
        : null
    };
  } else {
    // Staff members (Manager, Nurse, Staff, etc.)
    const totalAllowedStaff = tenant.maxStaff + tenant.additionalStaff;
    return {
      allowed: usage.staff < totalAllowedStaff,
      current: usage.staff,
      limit: totalAllowedStaff,
      needsPayment: usage.staff >= tenant.maxStaff && usage.staff < totalAllowedStaff,
      message: usage.staff >= totalAllowedStaff
        ? `Staff limit reached (${totalAllowedStaff}). Add more staff slots for $${ADDITIONAL_STAFF_PRICING[tenant.subscriptionTier]}/month each.`
        : null
    };
  }
};

/**
 * ✅ NEW: Add additional staff slots (paid)
 */
export const addAdditionalStaffSlots = async (tenantId, numberOfSlots, paymentMethodId) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  // Cannot add staff to free plan
  if (tenant.subscriptionTier === "free") {
    throw new Error("Cannot add additional staff on free trial. Please upgrade to a paid plan.");
  }

  const pricePerStaff = ADDITIONAL_STAFF_PRICING[tenant.subscriptionTier];
  const totalCost = numberOfSlots * pricePerStaff;

  // TODO: Process payment with Paystack
  // const paymentResult = await processPayment(paymentMethodId, totalCost);
  // if (!paymentResult.success) {
  //   throw new Error("Payment failed");
  // }

  // Update tenant
  tenant.additionalStaff += numberOfSlots;
  tenant.monthlyStaffCost = tenant.additionalStaff * pricePerStaff;
  await tenant.save();

  return {
    success: true,
    addedSlots: numberOfSlots,
    totalAdditionalStaff: tenant.additionalStaff,
    monthlyStaffCost: tenant.monthlyStaffCost,
    newTotalAllowed: tenant.maxStaff + tenant.additionalStaff,
    message: `Successfully added ${numberOfSlots} staff slot(s). Your new monthly cost is $${tenant.calculateMonthlyCost()}.`
  };
};

/**
 * ✅ NEW: Remove additional staff slots
 */
export const removeAdditionalStaffSlots = async (tenantId, numberOfSlots) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  if (numberOfSlots > tenant.additionalStaff) {
    throw new Error(`Cannot remove ${numberOfSlots} slots. You only have ${tenant.additionalStaff} additional staff slots.`);
  }

  // Check if removing slots would put current staff count over limit
  const usage = await getTenantUsage(tenantId);
  const newLimit = tenant.maxStaff + (tenant.additionalStaff - numberOfSlots);
  
  if (usage.staff > newLimit) {
    throw new Error(
      `Cannot remove slots. You currently have ${usage.staff} staff members. ` +
      `Removing ${numberOfSlots} slot(s) would set your limit to ${newLimit}. ` +
      `Please remove ${usage.staff - newLimit} staff member(s) first.`
    );
  }

  // Update tenant
  tenant.additionalStaff -= numberOfSlots;
  const pricePerStaff = ADDITIONAL_STAFF_PRICING[tenant.subscriptionTier];
  tenant.monthlyStaffCost = tenant.additionalStaff * pricePerStaff;
  await tenant.save();

  return {
    success: true,
    removedSlots: numberOfSlots,
    totalAdditionalStaff: tenant.additionalStaff,
    monthlyStaffCost: tenant.monthlyStaffCost,
    newTotalAllowed: tenant.maxStaff + tenant.additionalStaff
  };
};

/**
 * Check if tenant has exceeded any limits
 */
export const hasExceededLimits = async (tenantId, resourceType = null) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const usage = await getTenantUsage(tenantId);

  if (resourceType) {
    const resourceMap = {
      admins: { current: usage.admins, max: tenant.maxAdmins },
      staff: { current: usage.staff, max: tenant.maxStaff + tenant.additionalStaff },
      users: { current: usage.totalUsers, max: tenant.getTotalAllowedUsers() },
      branches: { current: usage.branches, max: tenant.maxBranches },
      items: { current: usage.items, max: tenant.maxItems }
    };

    const resource = resourceMap[resourceType];
    return resource.current >= resource.max;
  }

  return (
    usage.admins >= tenant.maxAdmins ||
    usage.staff >= (tenant.maxStaff + tenant.additionalStaff) ||
    usage.branches >= tenant.maxBranches ||
    usage.items >= tenant.maxItems
  );
};

/**
 * Calculate days until subscription renewal or trial end
 */
export const calculateDaysUntilRenewal = (tenant) => {
  const now = new Date();
  
  if (tenant.status === "trial" && tenant.trialEndsAt) {
    const diffTime = tenant.trialEndsAt - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      type: "trial",
      days: Math.max(0, diffDays),
      date: tenant.trialEndsAt
    };
  }
  
  if (tenant.subscriptionEndDate) {
    const diffTime = tenant.subscriptionEndDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      type: "subscription",
      days: Math.max(0, diffDays),
      date: tenant.subscriptionEndDate
    };
  }
  
  return null;
};

/**
 * Validate if upgrade is allowed
 */
export const validateSubscriptionUpgrade = (currentTier, newTier) => {
  const tierOrder = { free: 0, basic: 1, premium: 2 };
  
  if (!tierOrder.hasOwnProperty(newTier)) {
    return { valid: false, message: "Invalid subscription tier" };
  }
  
  if (tierOrder[newTier] <= tierOrder[currentTier]) {
    return { 
      valid: false, 
      message: "Cannot downgrade or stay on same tier using upgrade" 
    };
  }
  
  return { valid: true };
};

/**
 * Update tenant subscription limits based on new plan
 */
export const updateTenantLimits = async (tenantId, newTier) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const newPlan = SUBSCRIPTION_PLANS[newTier];
  
  tenant.subscriptionTier = newTier;
  tenant.maxBranches = newPlan.maxBranches;
  tenant.maxAdmins = newPlan.maxAdmins;
  tenant.maxStaff = newPlan.maxStaff;
  tenant.maxItems = newPlan.maxItems;
  tenant.status = "active";
  
  // End trial, start subscription
  const now = new Date();
  tenant.subscriptionStartDate = now;
  tenant.subscriptionEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  // Recalculate staff costs based on new tier pricing
  const pricePerStaff = ADDITIONAL_STAFF_PRICING[newTier];
  tenant.monthlyStaffCost = tenant.additionalStaff * pricePerStaff;
  
  await tenant.save();
  
  return tenant;
};

/**
 * Process subscription cancellation
 */
export const cancelTenantSubscription = async (tenantId, reason = null) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  tenant.status = "cancelled";
  await tenant.save();

  if (reason) {
    console.log(`Tenant ${tenant.companyName} cancelled. Reason: ${reason}`);
  }

  return {
    accessUntil: tenant.subscriptionEndDate || tenant.trialEndsAt,
    tenant
  };
};