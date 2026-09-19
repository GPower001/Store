import api from "./api";

export const getBranches = async () => {
  const { data } = await api.get("/branches");
  return data.data || [];
};

export const createBranch = async (payload) => {
  const { data } = await api.post("/branches", payload);
  return data.data;
};

export const updateBranch = async (id, payload) => {
  const { data } = await api.put(`/branches/${id}`, payload);
  return data.data;
};

export const deleteBranch = async (id) => {
  await api.delete(`/branches/${id}`);
};
