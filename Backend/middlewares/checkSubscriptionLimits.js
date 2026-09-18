// import Tenant from "../models/Tenant.js";
// import { hasExceededLimits } from "../services/subscriptionService.js";

// /**
//  * Middleware to check if tenant can add more of a specific resource
//  * 
//  * USAGE IN ROUTES:
//  * router.post("/users", authenticate, checkResourceLimit("users"), createUser);
//  * router.post("/branches", authenticate, checkResourceLimit("branches"), createBranch);
//  * router.post("/items", authenticate, checkResourceLimit("items"), addItem);
//  * 
//  * HOW IT WORKS:
//  * 1. Checks current usage vs limits
//  * 2. If at limit, returns 403 error with upgrade message
//  * 3. If under limit, allows request to continue
//  */
// export const checkResourceLimit = (resourceType) => {
//   return async (req, res, next) => {
//     try {
//       const tenantId = req.user.tenantId;

//       if (!tenantId) {
//         return res.status(400).json({
//           success: false,
//           message: "Tenant ID is required"
//         });
//       }

//       // Check if this specific resource has exceeded limits
//       const exceeded = await hasExceededLimits(tenantId, resourceType);

//       if (exceeded) {
//         return res.status(403).json({
//           success: false,
//           message: `${resourceType} limit reached. Please upgrade your subscription plan.`,
//           code: "LIMIT_REACHED",
//           upgradeUrl: "/subscription/plans",
//           resourceType
//         });
//       }

//       // Limit not exceeded - allow the request to proceed
//       next();
//     } catch (error) {
//       console.error("Check Resource Limit Error:", error);
//       res.status(500).json({
//         success: false,
//         message: "Failed to check subscription limits"
//       });
//     }
//   };
// };

// /**
//  * Middleware to check if tenant's subscription is active
//  * 
//  * USAGE IN ROUTES:
//  * router.use("/api/items", authenticate, checkSubscriptionStatus);
//  * 
//  * HOW IT WORKS:
//  * 1. Checks if subscription status is "active"
//  * 2. Checks if subscription hasn't expired
//  * 3. Blocks access if suspended/cancelled
//  */
// export const checkSubscriptionStatus = async (req, res, next) => {
//   try {
//     const tenantId = req.user.tenantId;

//     const tenant = await Tenant.findById(tenantId).select("status subscriptionEndDate subscriptionTier");
    
//     if (!tenant) {
//       return res.status(404).json({
//         success: false,
//         message: "Organization not found"
//       });
//     }

//     // Check if subscription is suspended or cancelled
//     if (tenant.status === "suspended") {
//       return res.status(403).json({
//         success: false,
//         message: "Your subscription is suspended. Please update your payment method.",
//         code: "SUBSCRIPTION_SUSPENDED",
//         contactSupport: true
//       });
//     }

//     if (tenant.status === "cancelled") {
//       return res.status(403).json({
//         success: false,
//         message: "Your subscription has been cancelled. Please renew to continue.",
//         code: "SUBSCRIPTION_CANCELLED",
//         renewUrl: "/subscription/plans"
//       });
//     }

//     // Check if subscription has expired (for paid plans)
//     if (tenant.subscriptionTier !== "free" && tenant.subscriptionEndDate) {
//       const now = new Date();
//       const endDate = new Date(tenant.subscriptionEndDate);
      
//       if (now > endDate) {
//         return res.status(403).json({
//           success: false,
//           message: "Your subscription has expired. Please renew to continue.",
//           code: "SUBSCRIPTION_EXPIRED",
//           renewUrl: "/subscription/plans"
//         });
//       }
//     }

//     // Subscription is active - proceed
//     next();
//   } catch (error) {
//     console.error("Check Subscription Status Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to verify subscription status"
//     });
//   }
// };

// /**
//  * Middleware to warn when approaching limits (soft limit check)
//  * 
//  * USAGE IN ROUTES:
//  * router.get("/dashboard", authenticate, warnIfNearLimit);
//  * 
//  * HOW IT WORKS:
//  * 1. Adds warning to response headers if near limit (>80%)
//  * 2. Doesn't block the request
//  * 3. Frontend can show banner: "You're using 9 of 10 users"
//  */
// export const warnIfNearLimit = async (req, res, next) => {
//   try {
//     const tenantId = req.user.tenantId;

//     const tenant = await Tenant.findById(tenantId);
//     if (!tenant) {
//       return next();
//     }

//     const { getTenantUsage } = await import("../services/subscriptionService.js");
//     const usage = await getTenantUsage(tenantId);

//     const warnings = [];

//     // Check each resource (warn if >80% used)
//     if (usage.users / tenant.maxUsers > 0.8) {
//       warnings.push({
//         resource: "users",
//         current: usage.users,
//         max: tenant.maxUsers,
//         percentage: Math.round((usage.users / tenant.maxUsers) * 100)
//       });
//     }

//     if (usage.branches / tenant.maxBranches > 0.8) {
//       warnings.push({
//         resource: "branches",
//         current: usage.branches,
//         max: tenant.maxBranches,
//         percentage: Math.round((usage.branches / tenant.maxBranches) * 100)
//       });
//     }

//     if (usage.items / tenant.maxItems > 0.8) {
//       warnings.push({
//         resource: "items",
//         current: usage.items,
//         max: tenant.maxItems,
//         percentage: Math.round((usage.items / tenant.maxItems) * 100)
//       });
//     }

//     // Add warnings to response headers (frontend can read these)
//     if (warnings.length > 0) {
//       res.setHeader("X-Subscription-Warnings", JSON.stringify(warnings));
//     }

//     next();
//   } catch (error) {
//     console.error("Warn If Near Limit Error:", error);
//     // Don't fail the request if warning check fails
//     next();
//   }
// };

// export default {
//   checkResourceLimit,
//   checkSubscriptionStatus,
//   warnIfNearLimit
// };

import Tenant from "../models/Tenant.js";
import { hasExceededLimits, getTenantUsage, canAddUser } from "../services/subscriptionService.js";
import { ADDITIONAL_STAFF_PRICING } from "../config/subscriptionPlans.js";

/**
 * ✅ UPDATED: Check resource limits based on user role
 * 
 * USAGE:
 * - For users: checkResourceLimit("users") - checks Admin vs Staff limits
 * - For branches: checkResourceLimit("branches")
 * - For items: checkResourceLimit("items")
 */
export const checkResourceLimit = (resourceType) => {
  return async (req, res, next) => {
    try {
      const tenantId = req.user.tenantId;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: "Tenant ID is required"
        });
      }

      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: "Organization not found"
        });
      }

      // ✅ SPECIAL HANDLING: For user creation, check role-based limits
      if (resourceType === "users") {
        const userRole = req.body.role || "Staff"; // Default to Staff if not specified
        
        // ✅ Check if trial has expired
        if (tenant.hasTrialExpired()) {
          return res.status(403).json({
            success: false,
            message: "Your 30-day free trial has expired. Please upgrade to continue adding users.",
            code: "TRIAL_EXPIRED",
            upgradeUrl: "/subscription/plans",
            trialEndDate: tenant.trialEndsAt
          });
        }
        
        // ✅ Check if user can be added based on role
        const result = await canAddUser(tenantId, userRole);
        
        if (!result.allowed) {
          // ✅ CASE 1: Staff member limit reached
          if (userRole !== "Admin") {
            const isBaseLimitReached = result.current >= tenant.maxStaff;
            
            // On free trial - cannot add more staff
            if (tenant.subscriptionTier === "free") {
              return res.status(403).json({
                success: false,
                message: "Staff limit reached on free trial. You can have 1 Admin + 1 Staff member. Upgrade to add more.",
                code: "STAFF_LIMIT_REACHED",
                details: {
                  current: result.current,
                  limit: result.limit,
                  role: userRole
                },
                action: {
                  type: "upgrade",
                  message: "Upgrade to Basic plan to get 1 Admin + 5 Staff members",
                  upgradeUrl: "/subscription/plans"
                }
              });
            }
            
            // On paid plan - can buy additional slots
            if (isBaseLimitReached) {
              return res.status(403).json({
                success: false,
                message: `Staff limit reached (${result.limit}). Add more staff slots for $${ADDITIONAL_STAFF_PRICING[tenant.subscriptionTier]}/month each.`,
                code: "STAFF_LIMIT_REACHED",
                details: {
                  current: result.current,
                  baseLimit: tenant.maxStaff,
                  additionalSlots: tenant.additionalStaff,
                  totalLimit: result.limit,
                  pricePerSlot: ADDITIONAL_STAFF_PRICING[tenant.subscriptionTier],
                  role: userRole
                },
                action: {
                  type: "buy-slots",
                  message: `Purchase additional staff slots for $${ADDITIONAL_STAFF_PRICING[tenant.subscriptionTier]}/month per staff`,
                  endpoint: "/api/subscription/add-staff-slots"
                }
              });
            }
          }
          
          // ✅ CASE 2: Admin limit reached
          else {
            return res.status(403).json({
              success: false,
              message: `Admin limit reached (${tenant.maxAdmins}). Upgrade your plan to add more admins.`,
              code: "ADMIN_LIMIT_REACHED",
              details: {
                current: result.current,
                limit: result.limit,
                role: userRole
              },
              action: {
                type: "upgrade",
                message: "Upgrade to Premium plan to get up to 3 Admin users",
                upgradeUrl: "/subscription/plans"
              }
            });
          }
        }
        
        // ✅ User can be added - proceed
        next();
      }
      
      // ✅ STANDARD RESOURCE LIMIT CHECK: For branches, items
      else {
        // Check if trial has expired
        if (tenant.hasTrialExpired()) {
          return res.status(403).json({
            success: false,
            message: "Your 30-day free trial has expired. Please upgrade to continue.",
            code: "TRIAL_EXPIRED",
            upgradeUrl: "/subscription/plans"
          });
        }
        
        const exceeded = await hasExceededLimits(tenantId, resourceType);

        if (exceeded) {
          return res.status(403).json({
            success: false,
            message: `${resourceType} limit reached. Please upgrade your subscription plan.`,
            code: "LIMIT_REACHED",
            upgradeUrl: "/subscription/plans",
            resourceType
          });
        }
        
        next();
      }

    } catch (error) {
      console.error("Check Resource Limit Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check subscription limits",
        error: error.message
      });
    }
  };
};

/**
 * Middleware to check if tenant's subscription is active
 * 
 * USAGE: router.use("/api/items", authenticate, checkSubscriptionStatus);
 * 
 * Blocks access if:
 * - Trial has expired
 * - Subscription is suspended
 * - Subscription is cancelled
 * - Subscription has expired
 */
export const checkSubscriptionStatus = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;

    const tenant = await Tenant.findById(tenantId).select(
      "status subscriptionEndDate subscriptionTier trialEndsAt companyName"
    );
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    // ✅ PRIORITY 1: Check if trial has expired
    if (tenant.hasTrialExpired()) {
      const daysExpired = Math.ceil((new Date() - tenant.trialEndsAt) / (1000 * 60 * 60 * 24));
      
      return res.status(403).json({
        success: false,
        message: `Your 30-day free trial expired ${daysExpired} day(s) ago. Please upgrade to continue using the system.`,
        code: "TRIAL_EXPIRED",
        trialEndDate: tenant.trialEndsAt,
        upgradeUrl: "/subscription/plans"
      });
    }

    // ✅ PRIORITY 2: Check if subscription is suspended
    if (tenant.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your subscription is suspended due to payment issues. Please update your payment method.",
        code: "SUBSCRIPTION_SUSPENDED",
        contactSupport: true,
        updatePaymentUrl: "/subscription/payment-method"
      });
    }

    // ✅ PRIORITY 3: Check if subscription is cancelled
    if (tenant.status === "cancelled") {
      return res.status(403).json({
        success: false,
        message: "Your subscription has been cancelled. Please renew to continue using the system.",
        code: "SUBSCRIPTION_CANCELLED",
        renewUrl: "/subscription/plans"
      });
    }

    // ✅ PRIORITY 4: Check if paid subscription has expired
    if (tenant.subscriptionTier !== "free" && tenant.status !== "trial" && tenant.subscriptionEndDate) {
      const now = new Date();
      const endDate = new Date(tenant.subscriptionEndDate);
      
      if (now > endDate) {
        const daysExpired = Math.ceil((now - endDate) / (1000 * 60 * 60 * 24));
        
        return res.status(403).json({
          success: false,
          message: `Your subscription expired ${daysExpired} day(s) ago. Please renew to continue.`,
          code: "SUBSCRIPTION_EXPIRED",
          subscriptionEndDate: tenant.subscriptionEndDate,
          renewUrl: "/subscription/plans"
        });
      }
    }

    // ✅ All checks passed - subscription is active
    next();
  } catch (error) {
    console.error("Check Subscription Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify subscription status",
      error: error.message
    });
  }
};

/**
 * Middleware to warn when approaching limits (soft limit check)
 * 
 * USAGE: router.get("/dashboard", authenticate, warnIfNearLimit);
 * 
 * Adds warning headers if resource usage > 80%
 * Does NOT block the request
 */
export const warnIfNearLimit = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return next();
    }

    const usage = await getTenantUsage(tenantId);
    const totalStaffLimit = tenant.maxStaff + tenant.additionalStaff;

    const warnings = [];

    // ✅ Check admin limit (warn at 80%)
    if (usage.admins / tenant.maxAdmins > 0.8) {
      warnings.push({
        resource: "admins",
        current: usage.admins,
        max: tenant.maxAdmins,
        percentage: Math.round((usage.admins / tenant.maxAdmins) * 100),
        message: `You're using ${usage.admins} of ${tenant.maxAdmins} admin slots`
      });
    }

    // ✅ Check staff limit (warn at 80%)
    if (totalStaffLimit > 0 && usage.staff / totalStaffLimit > 0.8) {
      warnings.push({
        resource: "staff",
        current: usage.staff,
        max: totalStaffLimit,
        percentage: Math.round((usage.staff / totalStaffLimit) * 100),
        canAddMore: tenant.subscriptionTier !== "free",
        pricePerSlot: ADDITIONAL_STAFF_PRICING[tenant.subscriptionTier],
        message: `You're using ${usage.staff} of ${totalStaffLimit} staff slots`
      });
    }

    // ✅ Check branch limit (warn at 80%)
    if (usage.branches / tenant.maxBranches > 0.8) {
      warnings.push({
        resource: "branches",
        current: usage.branches,
        max: tenant.maxBranches,
        percentage: Math.round((usage.branches / tenant.maxBranches) * 100),
        message: `You're using ${usage.branches} of ${tenant.maxBranches} branches`
      });
    }

    // ✅ Check item limit (warn at 80%)
    if (usage.items / tenant.maxItems > 0.8) {
      warnings.push({
        resource: "items",
        current: usage.items,
        max: tenant.maxItems,
        percentage: Math.round((usage.items / tenant.maxItems) * 100),
        message: `You're using ${usage.items} of ${tenant.maxItems} items`
      });
    }

    // ✅ Check trial expiry (warn in last 7 days)
    if (tenant.status === "trial" && tenant.trialEndsAt) {
      const daysLeft = Math.ceil((tenant.trialEndsAt - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 7 && daysLeft > 0) {
        warnings.push({
          resource: "trial",
          daysLeft: daysLeft,
          expiryDate: tenant.trialEndsAt,
          message: `Your free trial ends in ${daysLeft} day(s)`,
          action: "upgrade"
        });
      }
    }

    // ✅ Add warnings to response headers (frontend can read these)
    if (warnings.length > 0) {
      res.setHeader("X-Subscription-Warnings", JSON.stringify(warnings));
    }

    next();
  } catch (error) {
    console.error("Warn If Near Limit Error:", error);
    // Don't fail the request if warning check fails
    next();
  }
};

/**
 * ✅ NEW: Middleware to check if specific user role can be created
 * 
 * USAGE: router.post("/register", authenticate, adminOnly, checkUserRole, register);
 */
export const checkUserRole = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const userRole = req.body.role || "Staff";

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    // Check if trial expired
    if (tenant.hasTrialExpired()) {
      return res.status(403).json({
        success: false,
        message: "Your trial has expired. Upgrade to add users.",
        code: "TRIAL_EXPIRED"
      });
    }

    const result = await canAddUser(tenantId, userRole);

    if (!result.allowed) {
      return res.status(403).json({
        success: false,
        message: result.message,
        code: userRole === "Admin" ? "ADMIN_LIMIT_REACHED" : "STAFF_LIMIT_REACHED",
        details: {
          role: userRole,
          current: result.current,
          limit: result.limit
        }
      });
    }

    next();
  } catch (error) {
    console.error("Check User Role Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check user role limits"
    });
  }
};

export default {
  checkResourceLimit,
  checkSubscriptionStatus,
  warnIfNearLimit,
  checkUserRole
};