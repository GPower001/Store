import api from "./api";

export const getPOSItems = async () => {
  const { data } = await api.get("/items");
  return data.data || [];
};

export const completeSale = async (payload) => {
  const { data } = await api.post("/pos/sales", payload);
  return data.data;
};

export const scanPOSProduct = async (code) => {
  const { data } = await api.get(`/pos/scan/${encodeURIComponent(code)}`);
  return data.data;
};
