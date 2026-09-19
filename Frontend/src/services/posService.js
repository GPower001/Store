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

export const getSales = async (params = {}) => {
  const { data } = await api.get("/pos/sales", { params });
  return data;
};

export const getSale = async (id) => {
  const { data } = await api.get(`/pos/sales/${id}`);
  return data.data;
};
