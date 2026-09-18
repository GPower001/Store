import api from "./api";

const getData = (response) => response.data?.data ?? [];

export const getDashboardData = async () => {
	const results = await Promise.allSettled([
		api.get("/items"),
		api.get("/items/low-stock"),
		api.get("/stock-movements", { params: { page: 1, limit: 5 } }),
		api.get("/PurchaseOrder/stats"),
		api.get("/notifications"),
	]);

	const [itemsResult, lowStockResult, movementsResult, purchaseOrdersResult, notificationsResult] = results;
	const failedRequest = results.find((result) => result.status === "rejected");

	return {
		items: itemsResult.status === "fulfilled" ? getData(itemsResult.value) : [],
		lowStockItems: lowStockResult.status === "fulfilled" ? getData(lowStockResult.value) : [],
		movements: movementsResult.status === "fulfilled" ? getData(movementsResult.value) : [],
		purchaseOrders: purchaseOrdersResult.status === "fulfilled" ? getData(purchaseOrdersResult.value) : {},
		notifications: notificationsResult.status === "fulfilled" ? getData(notificationsResult.value) : [],
		requestError: failedRequest?.reason?.response?.data?.message || failedRequest?.reason?.message || "",
	};
};
