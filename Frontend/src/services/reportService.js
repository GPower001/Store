import api from "./api";

const getReport = async (path, params = {}) => {
	const { data } = await api.get(path, { params });
	return data.data;
};

export const getInventoryValuation = (params) => getReport("/reports/inventory-valuation", params);
export const getStockTrends = (params) => getReport("/reports/stock-trends", params);
export const getCategoryAnalysis = (params) => getReport("/reports/category-analysis", params);

export const downloadInventoryReport = async () => {
	const response = await api.get("/reports/export", {
		params: { type: "inventory", format: "csv" },
		responseType: "blob",
	});
	return response.data;
};
