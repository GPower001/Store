import api from "./api";

export const initializeSubscriptionPayment = async (newTier, staffSlots = 0) => {
  const { data } = await api.post("/subscription/initialize", {
    newTier,
    staffSlots,
    callbackUrl: `${window.location.origin}/subscription/checkout`,
  });
  return data.data;
};

export const verifySubscriptionPayment = async (reference) => {
  const { data } = await api.get(`/subscription/verify/${encodeURIComponent(reference)}`);
  return data;
};

export const getSubscriptionStatus = async () => {
  const { data } = await api.get("/subscription/status");
  return data.data;
};

export const getSubscriptionPlans = async () => {
  const { data } = await api.get("/subscription/plans");
  return data.data;
};

export const getSubscriptionLimits = async () => {
  const { data } = await api.get("/subscription/check-limits");
  return data.data;
};

export const addStaffSlots = async (numberOfSlots) => {
  const { data } = await api.post("/subscription/add-staff-slots", { numberOfSlots });
  return data.data;
};

export const cancelSubscription = async (reason) => {
  const { data } = await api.post("/subscription/cancel", { reason });
  return data;
};
