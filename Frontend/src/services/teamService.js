import api from "./api";

export const getTeamMembers = async () => {
  const { data } = await api.get("/auth/users");
  return data.data || [];
};

export const createTeamMember = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data.user || data.data;
};

export const updateTeamMember = async (id, payload) => {
  const { data } = await api.put(`/auth/users/${id}`, payload);
  return data.data;
};

export const deleteTeamMember = async (id) => {
  await api.delete(`/auth/users/${id}`);
};
