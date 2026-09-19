// export const SUBSCRIPTION_PLANS = {
//   free: {
//     name: "Free Trial",
//     price: 0,
//     billingCycle: "monthly",
//     maxBranches: 1,
//     maxUsers: 3,
//     maxItems: 100,
//     features: [
//       "Basic inventory management",
//       "1 branch location",
//       "Email support",
//       "7-day trial"
//     ]
//   },
//   basic: {
//     name: "Basic Plan",
//     price: 29.99,
//     billingCycle: "monthly",
//     maxBranches: 5,
//     maxUsers: 10,
//     maxItems: 1000,
//     features: [
//       "Multi-branch support",
//       "Stock movement tracking",
//       "Basic reports",
//       "Priority email support"
//     ]
//   },
//   premium: {
//     name: "Premium Plan",
//     price: 99.99,
//     billingCycle: "monthly",
//     maxBranches: 20,
//     maxUsers: 50,
//     maxItems: 10000,
//     features: [
//       "Unlimited branches",
//       "Advanced analytics",
//       "API access",
//       "24/7 phone support",
//       "Custom integrations"
//     ]
//   }
// };

export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free Trial",
    price: 0,
    billingCycle: "monthly",
    trialDays: 30, // 1 month free trial
    maxBranches: 1,
    maxAdmins: 1,
    maxStaff: 1, // Admin + 1 Staff = 2 total users
    maxItems: 100,
    features: [
      "1 Admin + 1 Staff user",
      "1 branch location",
      "Basic inventory management",
      "Email support",
      "30-day free trial"
    ]
  },
  basic: {
    name: "Basic Plan",
    price: 10000,
    billingCycle: "monthly",
    maxBranches: 5,
    maxAdmins: 1,
    maxStaff: 5, // Admin + 5 Staff = 6 total users
    maxItems: 1000,
    pricePerAdditionalStaff: 5.00, // $5 per additional staff member
    features: [
      "1 Admin + 5 Staff users",
      "Up to 5 branches",
      "Stock movement tracking",
      "Basic reports",
      "Priority email support",
      "$5/month per additional staff"
    ]
  },
  premium: {
    name: "Premium Plan",
    price: 25000,
    billingCycle: "monthly",
    maxBranches: 20,
    maxAdmins: 3,
    maxStaff: 20, // Up to 3 Admins + 20 Staff = 23 total users
    maxItems: 10000,
    pricePerAdditionalStaff: 4.00, // $4 per additional staff (cheaper on premium)
    features: [
      "Up to 3 Admins + 20 Staff users",
      "Up to 20 branches",
      "Advanced analytics",
      "API access",
      "24/7 phone support",
      "$4/month per additional staff",
      "Custom integrations"
    ]
  }
};

// Pricing for additional staff members (outside base plan)
export const ADDITIONAL_STAFF_PRICING = {
  free: null, // Cannot add more staff on free plan
  basic: 5.00, // $5 per additional staff per month
  premium: 4.00 // $4 per additional staff per month
};
