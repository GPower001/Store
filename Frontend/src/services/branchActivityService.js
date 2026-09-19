import api from "./api";

export const getBranchActivity = async (params = {}) => {
  const { data } = await api.get("/admin/activity-feed", { params: { ...params, limit: 100 } });
  return data.data || { activities: [], pagination: {} };
};
