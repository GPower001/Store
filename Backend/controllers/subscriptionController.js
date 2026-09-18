// import * as subscriptionService from "../services/subscriptionService.js";
// import { SUBSCRIPTION_PLANS } from "../config/subscriptionPlans.js";

// /**
//  * @desc Get all available subscription plans
//  * @route GET /api/subscription/plans
//  * @access Public
//  * 
//  * WHY: Let users see pricing before signing up
//  */
// export const getSubscriptionPlans = async (req, res) => {
//   try {
//     res.status(200).json({
//       success: true,
//       data: SUBSCRIPTION_PLANS
//     });
//   } catch (error) {
//     console.error("Get Plans Error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Failed to fetch subscription plans" 
//     });
//   }
// };

// /**
//  * @desc Get current subscription status and usage
//  * @route GET /api/subscription/status
//  * @access Private/Admin
//  * 
//  * WHY: Show tenant their current plan, limits, and usage
//  * RETURNS: { subscription info, current usage, days until renewal }
//  */
// export const getSubscriptionStatus = async (req, res) => {
//   try {
//     const tenantId = req.user.tenantId;

//     // Get tenant data
//     const tenant = await Tenant.findById(tenantId).lean();
//     if (!tenant) {
//       return res.status(404).json({ 
//         success: false,
//         message: "Organization not found" 
//       });
//     }

//     // Get current resource usage
//     const usage = await subscriptionService.getTenantUsage(tenantId);
    
//     // Calculate usage percentages
//     const usageDetails = subscriptionService.calculateUsagePercentages(usage, tenant);
    
//     // Get plan details
//     const currentPlan = SUBSCRIPTION_PLANS[tenant.subscriptionTier];
    
//     // Calculate days until renewal
//     const daysUntilRenewal = subscriptionService.calculateDaysUntilRenewal(
//       tenant.subscriptionEndDate
//     );

//     res.status(200).json({
//       success: true,
//       data: {
//         subscription: {
//           tier: tenant.subscriptionTier,
//           status: tenant.status,
//           startDate: tenant.subscriptionStartDate,
//           endDate: tenant.subscriptionEndDate,
//           daysUntilRenewal,
//           trialEndsAt: tenant.trialEndsAt
//         },
//         plan: currentPlan,
//         usage: usageDetails
//       }
//     });
//   } catch (error) {
//     console.error("Get Subscription Status Error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Failed to fetch subscription status" 
//     });
//   }
// };

// /**
//  * @desc Upgrade subscription to higher tier
//  * @route POST /api/subscription/upgrade
//  * @access Private/Admin
//  * 
//  * WHY: Allow tenant to move from free → basic or basic → premium
//  * REQUIRES: { newTier: "basic" or "premium", paymentMethodId: "..." }
//  */
// export const upgradeSubscription = async (req, res) => {
//   try {
//     const tenantId = req.user.tenantId;
//     const { newTier, paymentMethodId } = req.body;

//     // Validate the upgrade request
//     const tenant = await Tenant.findById(tenantId);
//     if (!tenant) {
//       return res.status(404).json({ 
//         success: false,
//         message: "Organization not found" 
//       });
//     }

//     const validation = subscriptionService.validateSubscriptionUpgrade(
//       tenant.subscriptionTier, 
//       newTier
//     );
    
//     if (!validation.valid) {
//       return res.status(400).json({
//         success: false,
//         message: validation.message
//       });
//     }

//     // TODO: Process payment with Stripe/Paystack
//     // const paymentResult = await processPayment(
//     //   paymentMethodId, 
//     //   SUBSCRIPTION_PLANS[newTier].price
//     // );
//     // if (!paymentResult.success) {
//     //   return res.status(402).json({ message: "Payment failed" });
//     // }

//     // Update subscription
//     const updatedTenant = await subscriptionService.updateTenantLimits(
//       tenantId, 
//       newTier
//     );

//     res.status(200).json({
//       success: true,
//       message: `Successfully upgraded to ${SUBSCRIPTION_PLANS[newTier].name}`,
//       data: {
//         tier: updatedTenant.subscriptionTier,
//         maxBranches: updatedTenant.maxBranches,
//         maxUsers: updatedTenant.maxUsers,
//         maxItems: updatedTenant.maxItems,
//         subscriptionEndDate: updatedTenant.subscriptionEndDate
//       }
//     });
//   } catch (error) {
//     console.error("Upgrade Subscription Error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Failed to upgrade subscription" 
//     });
//   }
// };

// /**
//  * @desc Cancel subscription
//  * @route POST /api/subscription/cancel
//  * @access Private/Admin
//  * 
//  * WHY: Allow tenant to cancel (access continues until end of period)
//  * REQUIRES: { reason: "too expensive", feedback: "..." }
//  */
// export const cancelSubscription = async (req, res) => {
//   try {
//     const tenantId = req.user.tenantId;
//     const { reason, feedback } = req.body;

//     const result = await subscriptionService.cancelTenantSubscription(
//       tenantId, 
//       reason
//     );

//     // TODO: Cancel recurring payment with payment provider
//     // await paymentProvider.cancelRecurring(tenantId);

//     res.status(200).json({
//       success: true,
//       message: "Subscription cancelled. Access will continue until end of billing period.",
//       data: {
//         accessUntil: result.accessUntil
//       }
//     });
//   } catch (error) {
//     console.error("Cancel Subscription Error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Failed to cancel subscription" 
//     });
//   }
// };

// /**
//  * @desc Check if tenant has exceeded limits
//  * @route GET /api/subscription/check-limits
//  * @access Private
//  * 
//  * WHY: Frontend calls this before allowing actions like "Add User"
//  * RETURNS: { exceeded: true/false, details for each resource }
//  */
// export const checkLimits = async (req, res) => {
//   try {
//     const tenantId = req.user.tenantId;

//     const tenant = await Tenant.findById(tenantId);
//     if (!tenant) {
//       return res.status(404).json({ 
//         success: false,
//         message: "Organization not found" 
//       });
//     }

//     const usage = await subscriptionService.getTenantUsage(tenantId);
    
//     const limits = {
//       users: {
//         current: usage.users,
//         max: tenant.maxUsers,
//         exceeded: usage.users >= tenant.maxUsers,
//         available: Math.max(0, tenant.maxUsers - usage.users)
//       },
//       branches: {
//         current: usage.branches,
//         max: tenant.maxBranches,
//         exceeded: usage.branches >= tenant.maxBranches,
//         available: Math.max(0, tenant.maxBranches - usage.branches)
//       },
//       items: {
//         current: usage.items,
//         max: tenant.maxItems,
//         exceeded: usage.items >= tenant.maxItems,
//         available: Math.max(0, tenant.maxItems - usage.items)
//       }
//     };

//     res.status(200).json({
//       success: true,
//       data: limits
//     });
//   } catch (error) {
//     console.error("Check Limits Error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Failed to check limits" 
//     });
//   }
// };

// /**
//  * @desc Handle webhook from payment provider
//  * @route POST /api/subscription/webhook
//  * @access Public (but verify signature)
//  * 
//  * WHY: Payment provider sends notifications about payments
//  * HANDLES: subscription renewed, payment failed, subscription cancelled
//  */
// export const handlePaymentWebhook = async (req, res) => {
//   try {
//     // TODO: Verify webhook signature from payment provider
//     // const isValid = await verifyWebhookSignature(req);
//     // if (!isValid) {
//     //   return res.status(401).json({ message: "Invalid signature" });
//     // }

//     const { event, data } = req.body;

//     switch (event) {
//       case "subscription.renewed":
//         // Payment successful - extend subscription
//         await Tenant.findByIdAndUpdate(data.tenantId, {
//           subscriptionEndDate: data.newEndDate,
//           status: "active"
//         });
//         console.log(`Subscription renewed for tenant ${data.tenantId}`);
//         break;

//       case "payment.failed":
//         // Payment failed - suspend after grace period
//         await Tenant.findByIdAndUpdate(data.tenantId, {
//           status: "suspended"
//         });
//         console.log(`Payment failed for tenant ${data.tenantId}`);
//         // TODO: Send email notification to tenant
//         break;

//       case "subscription.cancelled":
//         // User cancelled from payment provider dashboard
//         await Tenant.findByIdAndUpdate(data.tenantId, {
//           status: "cancelled"
//         });
//         console.log(`Subscription cancelled for tenant ${data.tenantId}`);
//         break;

//       default:
//         console.log(`Unhandled webhook event: ${event}`);
//     }

//     res.status(200).json({ received: true });
//   } catch (error) {
//     console.error("Webhook Error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Webhook processing failed" 
//     });
//   }
// };

import Tenant from "../models/Tenant.js";
import * as subscriptionService from "../services/subscriptionService.js";
import { SUBSCRIPTION_PLANS, ADDITIONAL_STAFF_PRICING } from "../config/subscriptionPlans.js";

/**
 * @desc Get all available subscription plans
 * @route GET /api/subscription/plans
 * @access Public
 */
export const getSubscriptionPlans = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        plans: SUBSCRIPTION_PLANS,
        additionalStaffPricing: ADDITIONAL_STAFF_PRICING
      }
    });
  } catch (error) {
    console.error("Get Plans Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch subscription plans" 
    });
  }
};

/**
 * @desc Get current subscription status and usage
 * @route GET /api/subscription/status
 * @access Private
 */
export const getSubscriptionStatus = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const tenant = await Tenant.findById(tenantId).lean();
    if (!tenant) {
      return res.status(404).json({ 
        success: false,
        message: "Organization not found" 
      });
    }

    const usage = await subscriptionService.getTenantUsage(tenantId);
    const usageDetails = subscriptionService.calculateUsagePercentages(usage, tenant);
    const currentPlan = SUBSCRIPTION_PLANS[tenant.subscriptionTier];
    const renewal = subscriptionService.calculateDaysUntilRenewal(tenant);

    res.status(200).json({
      success: true,
      data: {
        subscription: {
          tier: tenant.subscriptionTier,
          status: tenant.status,
          isTrialActive: tenant.status === "trial" && renewal?.type === "trial",
          trialEndsAt: tenant.trialEndsAt,
          subscriptionStartDate: tenant.subscriptionStartDate,
          subscriptionEndDate: tenant.subscriptionEndDate,
          renewal: renewal,
          monthlyCost: {
            base: currentPlan.price,
            additionalStaff: tenant.monthlyStaffCost,
            total: currentPlan.price + tenant.monthlyStaffCost
          }
        },
        plan: currentPlan,
        usage: usageDetails,
        additionalStaff: {
          count: tenant.additionalStaff,
          costPerStaff: ADDITIONAL_STAFF_PRICING[tenant.subscriptionTier],
          totalMonthlyCost: tenant.monthlyStaffCost
        }
      }
    });
  } catch (error) {
    console.error("Get Subscription Status Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch subscription status" 
    });
  }
};

/**
 * ✅ NEW: Add additional staff slots
 * @desc Add paid staff slots
 * @route POST /api/subscription/add-staff-slots
 * @access Private/Admin
 */
export const addStaffSlots = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { numberOfSlots, paymentMethodId } = req.body;

    if (!numberOfSlots || numberOfSlots < 1) {
      return res.status(400).json({
        success: false,
        message: "Number of slots must be at least 1"
      });
    }

    const result = await subscriptionService.addAdditionalStaffSlots(
      tenantId,
      numberOfSlots,
      paymentMethodId
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Add Staff Slots Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to add staff slots"
    });
  }
};

/**
 * ✅ NEW: Remove additional staff slots
 * @desc Remove paid staff slots
 * @route POST /api/subscription/remove-staff-slots
 * @access Private/Admin
 */
export const removeStaffSlots = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { numberOfSlots } = req.body;

    if (!numberOfSlots || numberOfSlots < 1) {
      return res.status(400).json({
        success: false,
        message: "Number of slots must be at least 1"
      });
    }

    const result = await subscriptionService.removeAdditionalStaffSlots(
      tenantId,
      numberOfSlots
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Remove Staff Slots Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to remove staff slots"
    });
  }
};

/**
 * @desc Upgrade subscription to higher tier
 * @route POST /api/subscription/upgrade
 * @access Private/Admin
 */
export const upgradeSubscription = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { newTier, paymentMethodId } = req.body;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ 
        success: false,
        message: "Organization not found" 
      });
    }

    const validation = subscriptionService.validateSubscriptionUpgrade(
      tenant.subscriptionTier, 
      newTier
    );
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // TODO: Process payment
    const updatedTenant = await subscriptionService.updateTenantLimits(
      tenantId, 
      newTier
    );

    res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${SUBSCRIPTION_PLANS[newTier].name}`,
      data: {
        tier: updatedTenant.subscriptionTier,
        maxBranches: updatedTenant.maxBranches,
        maxAdmins: updatedTenant.maxAdmins,
        maxStaff: updatedTenant.maxStaff,
        maxItems: updatedTenant.maxItems,
        subscriptionEndDate: updatedTenant.subscriptionEndDate,
        monthlyCost: updatedTenant.calculateMonthlyCost()
      }
    });
  } catch (error) {
    console.error("Upgrade Subscription Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to upgrade subscription" 
    });
  }
};

/**
 * @desc Cancel subscription
 * @route POST /api/subscription/cancel
 * @access Private/Admin
 */
export const cancelSubscription = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { reason, feedback } = req.body;

    const result = await subscriptionService.cancelTenantSubscription(
      tenantId, 
      reason
    );

    res.status(200).json({
      success: true,
      message: "Subscription cancelled. Access will continue until end of billing period.",
      data: {
        accessUntil: result.accessUntil
      }
    });
  } catch (error) {
    console.error("Cancel Subscription Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to cancel subscription" 
    });
  }
};

/**
 * @desc Check if tenant has exceeded limits
 * @route GET /api/subscription/check-limits
 * @access Private
 */
export const checkLimits = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ 
        success: false,
        message: "Organization not found" 
      });
    }

    const usage = await subscriptionService.getTenantUsage(tenantId);
    const totalAllowedStaff = tenant.maxStaff + tenant.additionalStaff;
    
    const limits = {
      admins: {
        current: usage.admins,
        max: tenant.maxAdmins,
        exceeded: usage.admins >= tenant.maxAdmins,
        available: Math.max(0, tenant.maxAdmins - usage.admins)
      },
      staff: {
        current: usage.staff,
        max: totalAllowedStaff,
        exceeded: usage.staff >= totalAllowedStaff,
        available: Math.max(0, totalAllowedStaff - usage.staff),
        baseLimit: tenant.maxStaff,
        additionalSlots: tenant.additionalStaff,
        canAddMore: tenant.subscriptionTier !== "free",
        pricePerAdditional: ADDITIONAL_STAFF_PRICING[tenant.subscriptionTier]
      },
      branches: {
        current: usage.branches,
        max: tenant.maxBranches,
        exceeded: usage.branches >= tenant.maxBranches,
        available: Math.max(0, tenant.maxBranches - usage.branches)
      },
      items: {
        current: usage.items,
        max: tenant.maxItems,
        exceeded: usage.items >= tenant.maxItems,
        available: Math.max(0, tenant.maxItems - usage.items)
      }
    };

    res.status(200).json({
      success: true,
      data: limits
    });
  } catch (error) {
    console.error("Check Limits Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to check limits" 
    });
  }
};

/**
 * @desc Handle webhook from payment provider
 * @route POST /api/subscription/webhook
 * @access Public
 */
export const handlePaymentWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    switch (event) {
      case "subscription.renewed":
        await Tenant.findByIdAndUpdate(data.tenantId, {
          subscriptionEndDate: data.newEndDate,
          status: "active"
        });
        break;

      case "payment.failed":
        await Tenant.findByIdAndUpdate(data.tenantId, {
          status: "suspended"
        });
        break;

      case "subscription.cancelled":
        await Tenant.findByIdAndUpdate(data.tenantId, {
          status: "cancelled"
        });
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Webhook processing failed" 
    });
  }
};