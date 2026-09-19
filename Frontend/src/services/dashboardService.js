import api from "./api";

const getData = (response) => response.data?.data ?? [];
let dashboardCache = null;
let dashboardCacheTime = 0;
const DASHBOARD_CACHE_MS = 30_000;

const formatDate = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const getDashboardData = async () => {
	if (dashboardCache && Date.now() - dashboardCacheTime < DASHBOARD_CACHE_MS) return dashboardCache;
	const results = await Promise.allSettled([
		api.get("/items", { params: { summary: "true" } }),
		api.get("/stock-movements", { params: { page: 1, limit: 5, includePagination: "false" } }),
		api.get("/notifications"),
		api.get("/pos/sales", { params: { status: "completed", startDate: formatDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)), endDate: formatDate(new Date()), page: 1, limit: 100 } }),
	]);

	const [itemsResult, movementsResult, notificationsResult, salesResult] = results;
	const failedRequest = results.find((result) => result.status === "rejected");
	const items = itemsResult.status === "fulfilled" ? getData(itemsResult.value) : [];
	const sales = salesResult.status === "fulfilled" ? getData(salesResult.value) : [];
	const salesByDay = sales.reduce((totals, sale) => {
		const date = formatDate(new Date(sale.createdAt));
		const current = totals.find((entry) => entry.date === date);
		if (current) current.total += Number(sale.total || 0);
		else totals.push({ date, total: Number(sale.total || 0) });
		return totals;
	}, []);
	const today = formatDate(new Date());
	const todaysSales = sales.filter((sale) => formatDate(new Date(sale.createdAt)) === today);

	const dashboard = {
		items,
		lowStockItems: items.filter((item) => Number(item.openingQty || 0) <= Number(item.minStock || 0)),
		movements: movementsResult.status === "fulfilled" ? getData(movementsResult.value) : [],
		notifications: notificationsResult.status === "fulfilled" ? getData(notificationsResult.value) : [],
		salesByDay,
		todaysSales: {
			amount: todaysSales.reduce((total, sale) => total + Number(sale.total || 0), 0),
			transactions: todaysSales.length,
		},
		requestError: failedRequest?.reason?.response?.data?.message || failedRequest?.reason?.message || "",
	};
	dashboardCache = dashboard;
	dashboardCacheTime = Date.now();
	return dashboard;
};
