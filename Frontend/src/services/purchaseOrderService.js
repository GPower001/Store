import api from "./api";

export const getPurchaseOrders = async () => {
  const { data } = await api.get("/PurchaseOrder", { params: { page: 1, limit: 100 } });
  return data.data?.purchaseOrders || [];
};

export const createPurchaseOrder = async (payload) => {
  const { data } = await api.post("/PurchaseOrder", payload);
  return data.data;
};
