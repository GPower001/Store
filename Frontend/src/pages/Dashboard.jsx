// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
// 	Boxes,
// 	CircleAlert,
// 	Clock,
// 	FileText,
// 	Info,
// 	Plus,
// 	Sparkles,
// 	ShoppingCart,
// 	TrendingUp,
// 	Wallet,
// } from "lucide-react";
// import useAuthStore from "../store/authStore";
// import { getDashboardData } from "../services/dashboardService";

// const formatCurrency = (value) => `\u20A6${Number(value || 0).toLocaleString("en-US")}`;

// const formatGreetingName = (name) => (name ? name.split(" ")[0] : "");
// const dateKey = (date) => {
// 	const value = new Date(date);
// 	return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
// };

// function getTimeOfDay() {
// 	const hour = new Date().getHours();
// 	if (hour < 12) return "morning";
// 	if (hour < 18) return "afternoon";
// 	return "evening";
// }

// function Dashboard() {
// 	const navigate = useNavigate();
// 	const user = useAuthStore((state) => state.user);
// 	const [dashboard, setDashboard] = useState(null);
// 	const [loading, setLoading] = useState(true);
// 	const [error, setError] = useState("");

// 	useEffect(() => {
// 		let active = true;
// 		getDashboardData()
// 			.then((data) => {
// 				if (!active) return;
// 				setDashboard(data);
// 				setError(data.requestError);
// 			})
// 			.catch((requestError) => {
// 				if (active) setError(requestError.message);
// 			})
// 			.finally(() => {
// 				if (active) setLoading(false);
// 			});
// 		return () => {
// 			active = false;
// 		};
// 	}, []);

// 		const items = dashboard?.items || [];
// 	const lowStockItems = dashboard?.lowStockItems || [];
// 	const movements = dashboard?.movements || [];
// 	const notifications = dashboard?.notifications || [];

// 	const todaysSales = dashboard?.todaysSales?.amount ?? 0;
// 	const todaysTransactions = dashboard?.todaysSales?.transactions ?? 0;
// 	const collectedToday = dashboard?.collectedToday ?? 0;
// 	const moneyOwed = dashboard?.moneyOwed ?? 0;
// 	const productsInStock = dashboard?.productsInStock ?? items.length;
// 	const unitsInStock =
// 		dashboard?.unitsInStock ??
// 		items.reduce((sum, item) => sum + Number(item.openingQty || 0), 0);
// 	const outOfStockItems = items.filter((item) => Number(item.openingQty || 0) === 0);
// 	const stockAlerts = dashboard?.stockAlerts ?? lowStockItems.length + outOfStockItems.length;
// 	const openInvoices = dashboard?.openInvoices ?? 0;
// 	const salesByDay = dashboard?.salesByDay || [];
// 	const stockLevels = [
// 		{
// 			label: "Healthy",
// 			count: items.filter((item) => Number(item.openingQty || 0) > Number(item.minStock || 0)).length,
// 		},
// 		{
// 			label: "Low stock",
// 			count: lowStockItems.length,
// 		},
// 		{
// 			label: "Out of stock",
// 			count: outOfStockItems.length,
// 		},
// 	];
// 	const maxStockCount = Math.max(...stockLevels.map((level) => level.count), 1);
// 	const recentActivity = (movements.length ? movements : notifications).slice(0, 5).map((entry) => {
// 		if (entry?.itemId && typeof entry.itemId === "object") {
// 			return {
// 				title: entry.itemId.name || "Inventory update",
// 				detail: entry.createdAt
// 					? `${entry.movementType || "Updated"} • ${new Date(entry.createdAt).toLocaleDateString("en-US", {
// 						month: "short",
// 						day: "numeric",
// 					})}`
// 					: entry.movementType || "Recent update",
// 			};
// 		}
// 		return {
// 			title: entry?.title || entry?.message || "Inventory update",
// 			detail: entry?.description || entry?.type || "Recent update",
// 		};
// 	});
// 	const topProducts = [...items]
// 		.sort((a, b) => Number(b.price || 0) * Number(b.openingQty || 0) - Number(a.price || 0) * Number(a.openingQty || 0))
// 		.slice(0, 4)
// 		.map((item, index) => ({
// 			name: item.name,
// 			qty: Number(item.openingQty || 0),
// 			value: Number(item.price || 0) * Number(item.openingQty || 0),
// 			rank: index + 1,
// 		}));
// 	const inventoryCoverage = items.length ? Math.round(((items.filter((item) => Number(item.openingQty || 0) > Number(item.minStock || 0)).length / items.length) * 100)) : 0;
// 	const aiInsights = [
// 		`${inventoryCoverage}% of products are above their minimum stock target.`,
// 		`${lowStockItems.length} items are approaching a reorder point and may need attention soon.`,
// 		`${outOfStockItems.length} items are currently unavailable, which could reduce sales this week.`,
// 	];

// 	return (
// 		<div className="dashboard-content">
// 			<header className="dashboard-heading">
// 				<div className="dashboard-heading-copy">
// 					<h1>
// 						Good {getTimeOfDay()}
// 						{user?.name ? `, ${formatGreetingName(user.name)}` : ""}
// 					</h1>
// 					<p className="dashboard-subtitle">Here's what's happening across your business today.</p>
// 				</div>
// 				<div className="dashboard-actions">
// 					<button className="secondary-action" onClick={() => navigate("/inventory?add=1")}><Plus size={16} /> Add product</button>
// 					<button className="primary-action-dark" onClick={() => navigate("/pos")}><ShoppingCart size={16} /> Open POS</button>
// 				</div>
// 			</header>

// 			{error && (
// 				<div className="dashboard-alert" role="alert">
// 					<CircleAlert size={17} /> Some dashboard data could not be loaded: {error}
// 				</div>
// 			)}

// 			{loading ? (
// 				<DashboardLoading />
// 			) : (
// 				<>
// 					<section className="metric-grid" aria-label="Business overview">
// 						<MetricCard
// 							icon={<TrendingUp size={17} />}
// 							label="Today's sales"
// 							infoText="Total value of sales recorded today"
// 							value={formatCurrency(todaysSales)}
// 							detail={`${todaysTransactions.toLocaleString()} transaction${todaysTransactions === 1 ? "" : "s"}`}
// 						/>
// 						<MetricCard
// 							icon={<Wallet size={17} />}
// 							label="Collected today"
// 							infoText="Cash and payments received today"
// 							value={formatCurrency(collectedToday)}
// 							detail="cash received"
// 						/>
// 						<MetricCard
// 							icon={<Clock size={17} />}
// 							label="Money owed"
// 							infoText="Total outstanding balance across unpaid invoices"
// 							value={formatCurrency(moneyOwed)}
// 							detail="unpaid invoices"
// 						/>
// 						<MetricCard
// 							icon={<Boxes size={17} />}
// 							label="Products in stock"
// 							value={productsInStock}
// 							detail={`${unitsInStock.toLocaleString()} units total`}
// 						/>
// 						<MetricCard
// 							icon={<CircleAlert size={17} />}
// 							label="Stock alerts"
// 							value={stockAlerts}
// 							detail={stockAlerts === 0 ? "All healthy" : `${stockAlerts} item${stockAlerts === 1 ? "" : "s"} need attention`}
// 						/>
// 						<MetricCard
// 							icon={<FileText size={17} />}
// 							label="Open invoices"
// 							value={openInvoices}
// 							detail="draft & issued"
// 						/>
// 					</section>

// 					<section className="dashboard-panel sales-panel">
// 						<div className="sales-panel-header">
// 							<h2>Sales · last 7 days</h2>
// 							<p>Total revenue per day</p>
// 						</div>
// 						<SalesChart data={salesByDay} />
// 					</section>

// 					<section className="dashboard-grid" aria-label="Inventory overview cards">
// 						<DashboardCard title="Out of stock" icon={<CircleAlert size={16} />} accent="danger" className="inventory-card">
// 							{outOfStockItems.length ? (
// 								<ul className="dashboard-list">
// 									{outOfStockItems.slice(0, 4).map((item) => (
// 										<li key={item._id || item.name}>
// 											<span>{item.name}</span>
// 											<strong>{Number(item.openingQty || 0)}</strong>
// 										</li>
// 									))}
// 								</ul>
// 							) : (
// 								<p className="empty-state">No items are currently out of stock.</p>
// 							)}
// 						</DashboardCard>

// 						<DashboardCard title="Low stock" icon={<CircleAlert size={16} />} accent="warning" className="inventory-card">
// 							{lowStockItems.length ? (
// 								<ul className="dashboard-list">
// 									{lowStockItems.slice(0, 4).map((item) => (
// 										<li key={item._id || item.name}>
// 											<span>{item.name}</span>
// 											<strong>{Number(item.openingQty || 0)}</strong>
// 										</li>
// 									))}
// 								</ul>
// 							) : (
// 								<p className="empty-state">No low-stock alerts right now.</p>
// 							)}
// 						</DashboardCard>

// 						<DashboardCard title="Top products today" icon={<TrendingUp size={16} />} accent="success" className="inventory-card ranking-card">
// 							{topProducts.length ? (
// 								<ul className="dashboard-list product-list">
// 									{topProducts.map((product) => (
// 										<li key={product.name}>
// 											<div>
// 												<span className="rank-badge">#{product.rank}</span>
// 												<strong>{product.name}</strong>
// 											</div>
// 											<small>{product.qty} units</small>
// 										</li>
// 									))}
// 								</ul>
// 							) : (
// 								<p className="empty-state">Product data is not available yet.</p>
// 							)}
// 						</DashboardCard>

// 						<DashboardCard title="Stock levels" icon={<Boxes size={16} />} accent="neutral" className="inventory-card stock-card">
// 							<div className="stock-levels">
// 								{stockLevels.map((level) => (
// 									<div key={level.label} className="stock-level-row">
// 										<div className="stock-level-meta">
// 											<span>{level.label}</span>
// 											<strong>{level.count}</strong>
// 										</div>
// 										<div className="stock-level-bar">
// 											<span style={{ width: `${(level.count / maxStockCount) * 100}%` }} />
// 										</div>
// 									</div>
// 								))}
// 							</div>
// 						</DashboardCard>

// 						<DashboardCard title="Recent activity" icon={<Clock size={16} />} accent="info" className="wide-card activity-card">
// 							{recentActivity.length ? (
// 								<ul className="activity-list">
// 									{recentActivity.map((activity, index) => (
// 										<li key={`${activity.title}-${index}`}>
// 											<span className="activity-dot" aria-hidden="true" />
// 											<div>
// 												<strong>{activity.title}</strong>
// 												<small>{activity.detail}</small>
// 											</div>
// 										</li>
// 									))}
// 								</ul>
// 							) : (
// 								<p className="empty-state">No recent activity available.</p>
// 							)}
// 						</DashboardCard>

// 						<DashboardCard title="AI Business Insights" accent="insight" className="wide-card insight-card">
// 							<div className="insight-summary">
// 								<span className="insight-icon"><Sparkles size={17} /></span>
// 								<p>Clear signals from your inventory, ready for action.</p>
// 								<span className="insight-status">Live signal</span>
// 							</div>
// 							<ul className="insight-list">
// 								{aiInsights.map((insight, index) => (
// 									<li key={`${insight}-${index}`}>
// 										<span className="insight-index">0{index + 1}</span>
// 										<span>{insight}</span>
// 									</li>
// 								))}
// 							</ul>
// 						</DashboardCard>
// 					</section>
// 				</>
// 			)}
// 		</div>
// 	);
// }


// function DashboardLoading() {
// 	return (
// 		<div className="dashboard-loading">
// 			<span>Loading live inventory data...</span>
// 		</div>
// 	);
// }

// function DashboardCard({ title, icon, accent, className = "", children }) {
// 	return (
// 		<article className={`dashboard-card ${accent} ${className}`.trim()}>
// 			<div className="dashboard-card-header">
// 				<div className="dashboard-card-title">
// 					{icon && <span className="dashboard-card-icon">{icon}</span>}
// 					<h3>{title}</h3>
// 				</div>
// 			</div>
// 			{children}
// 		</article>
// 	);
// }

// function MetricCard({ icon, label, infoText, value, detail }) {
// 	return (
// 		<article className="metric-card">
// 			<div className="metric-card-header">
// 				<span className="metric-label">
// 					{label}
// 					{infoText && <Info size={12} title={infoText} />}
// 				</span>
// 				<span className="metric-icon">{icon}</span>
// 			</div>
// 			<strong className="metric-value">{value}</strong>
// 			<span className="metric-detail">{detail}</span>
// 		</article>
// 	);
// }

// function SalesChart({ data }) {
// 	const days = Array.from({ length: 7 }).map((_, index) => {
// 		const date = new Date();
// 		date.setDate(date.getDate() - (6 - index));
// 		const match = data.find((entry) => entry.date === dateKey(date));
// 		return {
// 			label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
// 			total: Number(match?.total || 0),
// 		};
// 	});

// 	const maxTotal = Math.max(...days.map((day) => day.total), 1);
// 	const hasSales = days.some((day) => day.total > 0);
// 	const yAxis = [1, .75, .5, .25, 0].map((ratio) => Math.round(maxTotal * ratio));

// 	return (
// 		<div className="sales-chart">
// 			{hasSales ? <div className="sales-chart-frame"><div className="sales-chart-y-axis">{yAxis.map((value, index) => <span key={`${value}-${index}`}>{formatCurrency(value)}</span>)}</div><div className="sales-chart-plot"><div className="sales-chart-grid-lines">{yAxis.map((value, index) => <span key={`${value}-${index}`} />)}</div><div className="sales-chart-bars">
// 				{days.map((day) => (
// 					<div className="sales-chart-column" key={day.label}>
// 						<div className="sales-chart-track">
// 							<div className="sales-chart-bar" style={{ height: `${Math.max((day.total / maxTotal) * 100, 3)}%` }} title={`${day.label}: ${formatCurrency(day.total)}`}><span>{formatCurrency(day.total)}</span></div>
// 						</div>
// 						<span>{day.label}</span>
// 					</div>
// 				))}
// 			</div></div></div> : <div className="sales-chart-empty"><TrendingUp size={22} /><strong>No sales data yet</strong><span>Sales activity will appear here once transactions are recorded.</span></div>}
// 		</div>
// 	);
// }

// export default Dashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Boxes,
	Check,
	CircleAlert,
	Clock,
	FileText,
	Info,
	Plus,
	Sparkles,
	ShoppingCart,
	TrendingUp,
	Wallet,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { getDashboardData } from "../services/dashboardService";
import "../index.css";

const formatCurrency = (value) => `\u20A6${Number(value || 0).toLocaleString("en-US")}`;
const formatCompactCurrency = (value) =>
	`\u20A6${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0))}`;

const formatGreetingName = (name) => (name ? name.split(" ")[0] : "");
const dateKey = (date) => {
	const value = new Date(date);
	return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};

function getTimeOfDay() {
	const hour = new Date().getHours();
	if (hour < 12) return "morning";
	if (hour < 18) return "afternoon";
	return "evening";
}

function buildChartDays(data) {
	return Array.from({ length: 7 }).map((_, index) => {
		const date = new Date();
		date.setDate(date.getDate() - (6 - index));
		const match = data.find((entry) => entry.date === dateKey(date));
		return {
			label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
			total: Number(match?.total || 0),
			isToday: index === 6,
		};
	});
}

function Dashboard() {
	const navigate = useNavigate();
	const user = useAuthStore((state) => state.user);
	const [dashboard, setDashboard] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;
		getDashboardData()
			.then((data) => {
				if (!active) return;
				setDashboard(data);
				setError(data.requestError);
			})
			.catch((requestError) => {
				if (active) setError(requestError.message);
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
	}, []);

	const items = dashboard?.items || [];
	const lowStockItems = dashboard?.lowStockItems || [];
	const movements = dashboard?.movements || [];
	const notifications = dashboard?.notifications || [];

	const todaysSales = dashboard?.todaysSales?.amount ?? 0;
	const todaysTransactions = dashboard?.todaysSales?.transactions ?? 0;
	const collectedToday = dashboard?.collectedToday ?? 0;
	const moneyOwed = dashboard?.moneyOwed ?? 0;
	const productsInStock = dashboard?.productsInStock ?? items.length;
	const unitsInStock =
		dashboard?.unitsInStock ??
		items.reduce((sum, item) => sum + Number(item.openingQty || 0), 0);
	const outOfStockItems = items.filter((item) => Number(item.openingQty || 0) === 0);
	const stockAlerts = dashboard?.stockAlerts ?? lowStockItems.length + outOfStockItems.length;
	const openInvoices = dashboard?.openInvoices ?? 0;
	const salesByDay = dashboard?.salesByDay || [];

	const stockLevels = [
		{
			key: "healthy",
			label: "Healthy",
			count: items.filter((item) => Number(item.openingQty || 0) > Number(item.minStock || 0)).length,
		},
		{ key: "low", label: "Low stock", count: lowStockItems.length },
		{ key: "out", label: "Out of stock", count: outOfStockItems.length },
	];
	const stockTotal = stockLevels.reduce((sum, level) => sum + level.count, 0);

	const recentActivity = (movements.length ? movements : notifications).slice(0, 5).map((entry) => {
		if (entry?.itemId && typeof entry.itemId === "object") {
			return {
				title: entry.itemId.name || "Inventory update",
				detail: entry.createdAt
					? `${entry.movementType || "Updated"} • ${new Date(entry.createdAt).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					})}`
					: entry.movementType || "Recent update",
			};
		}
		return {
			title: entry?.title || entry?.message || "Inventory update",
			detail: entry?.description || entry?.type || "Recent update",
		};
	});

	const topProducts = [...items]
		.sort((a, b) => Number(b.price || 0) * Number(b.openingQty || 0) - Number(a.price || 0) * Number(a.openingQty || 0))
		.slice(0, 4)
		.map((item, index) => ({
			name: item.name,
			qty: Number(item.openingQty || 0),
			value: Number(item.price || 0) * Number(item.openingQty || 0),
			rank: index + 1,
		}));

	const inventoryCoverage = items.length
		? Math.round((items.filter((item) => Number(item.openingQty || 0) > Number(item.minStock || 0)).length / items.length) * 100)
		: 0;
	const aiInsights = [
		`${inventoryCoverage}% of products are above their minimum stock target.`,
		`${lowStockItems.length} items are approaching a reorder point and may need attention soon.`,
		`${outOfStockItems.length} items are currently unavailable, which could reduce sales this week.`,
	];

	const chartDays = buildChartDays(salesByDay);
	const weekTotal = chartDays.reduce((sum, day) => sum + day.total, 0);

	const metrics = [
		{
			tone: "blue",
			icon: <TrendingUp size={21} />,
			label: "Today's sales",
			infoText: "Total value of sales recorded today",
			value: formatCurrency(todaysSales),
			detail: `${todaysTransactions.toLocaleString()} transaction${todaysTransactions === 1 ? "" : "s"}`,
		},
		{
			tone: "mint",
			icon: <Wallet size={21} />,
			label: "Collected today",
			infoText: "Cash and payments received today",
			value: formatCurrency(collectedToday),
			detail: "cash received",
		},
		{
			tone: "orange",
			icon: <Clock size={21} />,
			label: "Money owed",
			infoText: "Total outstanding balance across unpaid invoices",
			value: formatCurrency(moneyOwed),
			detail: "unpaid invoices",
		},
		{
			tone: "sky",
			icon: <Boxes size={21} />,
			label: "Products in stock",
			value: productsInStock,
			detail: `${unitsInStock.toLocaleString()} units total`,
		},
		{
			tone: stockAlerts > 0 ? "pink" : "white",
			icon: <CircleAlert size={21} />,
			label: "Stock alerts",
			value: stockAlerts,
			detail: stockAlerts === 0 ? "All healthy" : `${stockAlerts} item${stockAlerts === 1 ? "" : "s"} need attention`,
		},
		{
			tone: "sun",
			icon: <FileText size={21} />,
			label: "Open invoices",
			value: openInvoices,
			detail: "draft & issued",
		},
	];

	const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

	return (
		<div className="dash">
			<header className="dash-hero">
				{!loading && (
					<button
						type="button"
						className={`dash-sticker ${stockAlerts > 0 ? "is-alert" : "is-ok"}`}
						onClick={() => navigate("/inventory")}
					>
						{stockAlerts > 0 ? <CircleAlert size={18} /> : <Check size={18} strokeWidth={3} />}
						{stockAlerts > 0
							? `${stockAlerts} item${stockAlerts === 1 ? "" : "s"} need restocking`
							: "All stock healthy"}
					</button>
				)}
				<div className="dash-hero-copy">
					<p className="dash-date">{todayLabel}</p>
					<h1>
						Good {getTimeOfDay()}
						{user?.name ? `, ${formatGreetingName(user.name)}` : ""}
					</h1>
					<p className="dash-hero-sub">Here's what's happening across your business today.</p>
				</div>
				<div className="dash-hero-actions">
					<button type="button" className="dash-btn dash-btn-light" onClick={() => navigate("/inventory?add=1")}><Plus size={18} /> Add product</button>
					<button type="button" className="dash-btn dash-btn-blue" onClick={() => navigate("/pos")}><ShoppingCart size={18} /> Open POS</button>
				</div>
			</header>

			{error && (
				<div className="dash-alert" role="alert">
					<CircleAlert size={18} /> Some dashboard data could not be loaded: {error}
				</div>
			)}

			{loading ? (
				<DashboardLoading />
			) : (
				<>
					<section className="dash-metrics" aria-label="Business overview">
						{metrics.map((metric) => (
							<MetricCard key={metric.label} {...metric} />
						))}
					</section>

					<section className="dash-panel" aria-label="Sales for the last 7 days">
						<div className="dash-panel-head">
							<div>
								<h2>Sales · last 7 days</h2>
								<p>Total revenue per day</p>
							</div>
							<div className="dash-panel-side">
								<span className="dash-key"><i className="key-peak" /> Best day <i className="key-today" /> Today</span>
								<span className="dash-week-total">{formatCurrency(weekTotal)}</span>
							</div>
						</div>
						<SalesChart days={chartDays} />
					</section>

					<section className="dash-grid" aria-label="Inventory overview">
						<DashCard title="Out of stock" icon={<CircleAlert size={21} />} tone="pink" count={outOfStockItems.length}>
							{outOfStockItems.length ? (
								<ul className="dash-rows">
									{outOfStockItems.slice(0, 4).map((item) => (
										<li key={item._id || item.name} className="dash-row is-out">
											<span className="dash-row-main">
												<span className="dash-row-name">{item.name}</span>
												{Number(item.minStock || 0) > 0 && <small className="dash-row-sub">Reorder at {Number(item.minStock)}</small>}
											</span>
											<span className="dash-qty dash-qty-out">0 left</span>
										</li>
									))}
								</ul>
							) : (
								<EmptyNote>Nothing is out of stock.</EmptyNote>
							)}
						</DashCard>

						<DashCard title="Low stock" icon={<CircleAlert size={21} />} tone="sun" count={lowStockItems.length}>
							{lowStockItems.length ? (
								<ul className="dash-rows">
									{lowStockItems.slice(0, 4).map((item) => {
										const qty = Number(item.openingQty || 0);
										const min = Number(item.minStock || 0);
										const fill = Math.min(100, Math.round((qty / Math.max(min, 1)) * 100));
										return (
											<li key={item._id || item.name} className="dash-row is-low">
												<span className="dash-row-main">
													<span className="dash-row-name">{item.name}</span>
													<span className="dash-mini-bar" aria-hidden="true"><i style={{ width: `${fill}%` }} /></span>
													{min > 0 && <small className="dash-row-sub">Reorder at {min}</small>}
												</span>
												<span className="dash-qty dash-qty-low">{qty} left</span>
											</li>
										);
									})}
								</ul>
							) : (
								<EmptyNote>No low-stock alerts right now.</EmptyNote>
							)}
						</DashCard>

						<DashCard title="Stock levels" icon={<Boxes size={21} />} tone="sky">
							{stockTotal ? (
								<>
									<div className="dash-stack" role="img" aria-label={stockLevels.map((level) => `${level.label}: ${level.count}`).join(", ")}>
										{stockLevels.map((level) => level.count > 0 && (
											<span key={level.key} className={`seg-${level.key}`} style={{ flex: level.count }} />
										))}
									</div>
									<ul className="dash-legend-rows">
										{stockLevels.map((level) => (
											<li key={level.key}>
												<i className={`dash-swatch seg-${level.key}`} />
												{level.label}
												<strong>{level.count}</strong>
											</li>
										))}
									</ul>
								</>
							) : (
								<EmptyNote>Add products to start tracking stock levels.</EmptyNote>
							)}
						</DashCard>

						<DashCard title="Top stock by value" icon={<TrendingUp size={21} />} tone="mint">
							{topProducts.length ? (
								<ul className="dash-rows">
									{topProducts.map((product) => (
										<li key={product.name} className="dash-row">
											<span className={`dash-rank rank-${product.rank}`}>{product.rank}</span>
											<span className="dash-row-main">
												<span className="dash-row-name">{product.name}</span>
												<small className="dash-row-sub">{product.qty.toLocaleString()} units</small>
											</span>
											<span className="dash-row-value">{formatCurrency(product.value)}</span>
										</li>
									))}
								</ul>
							) : (
								<EmptyNote>Product data is not available yet.</EmptyNote>
							)}
						</DashCard>

						<DashCard title="Recent activity" icon={<Clock size={21} />} tone="orange">
							{recentActivity.length ? (
								<ul className="dash-timeline">
									{recentActivity.map((activity, index) => (
										<li key={`${activity.title}-${index}`}>
											<span className="dash-dot" aria-hidden="true" />
											<div>
												<strong>{activity.title}</strong>
												<small>{activity.detail}</small>
											</div>
										</li>
									))}
								</ul>
							) : (
								<EmptyNote>No recent activity yet.</EmptyNote>
							)}
						</DashCard>

						<DashCard title="AI Business Insights" icon={<Sparkles size={21} />} tone="sun" className="dash-insights" badge="Live signal">
							<p className="dash-insights-lead">Clear signals from your inventory, ready for action.</p>
							<ul className="dash-insight-list">
								{aiInsights.map((insight, index) => (
									<li key={`${insight}-${index}`}>
										<span className="dash-insight-dot" aria-hidden="true" />
										<span>{insight}</span>
									</li>
								))}
							</ul>
						</DashCard>
					</section>
				</>
			)}
		</div>
	);
}

function DashboardLoading() {
	return (
		<div className="dash-loading" role="status">
			<span className="dash-spinner" aria-hidden="true" />
			<span>Loading live inventory data...</span>
		</div>
	);
}

function EmptyNote({ children }) {
	return (
		<p className="dash-empty">
			<span className="dash-empty-check"><Check size={14} strokeWidth={3} /></span>
			{children}
		</p>
	);
}

function DashCard({ title, icon, tone, count, badge, className = "", children }) {
	return (
		<article className={`dash-card tone-${tone} ${className}`.trim()}>
			<header className="dash-card-head">
				<span className="dash-card-icon">{icon}</span>
				<h3>{title}</h3>
				{typeof count === "number" && <span className="dash-count">{count}</span>}
				{badge && <span className="dash-badge">{badge}</span>}
			</header>
			{children}
		</article>
	);
}

function MetricCard({ tone, icon, label, infoText, value, detail }) {
	return (
		<article className={`dash-metric tone-${tone}`}>
			<div className="dash-metric-head">
				<span className="dash-metric-label">
					{label}
					{infoText && (
						<span className="dash-info" title={infoText} aria-label={infoText} tabIndex={0}>
							<Info size={14} />
						</span>
					)}
				</span>
				<span className="dash-metric-icon">{icon}</span>
			</div>
			<strong className="dash-metric-value">{value}</strong>
			<span className="dash-metric-detail">{detail}</span>
		</article>
	);
}

function SalesChart({ days }) {
	const maxTotal = Math.max(...days.map((day) => day.total), 1);
	const hasSales = days.some((day) => day.total > 0);
	const yAxis = [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.round(maxTotal * ratio));

	if (!hasSales) {
		return (
			<div className="dash-chart-empty">
				<span><TrendingUp size={24} /></span>
				<strong>No sales data yet</strong>
				<small>Sales activity will appear here once transactions are recorded.</small>
			</div>
		);
	}

	return (
		<div className="dash-chart-frame">
			<div className="dash-chart-y" aria-hidden="true">
				{yAxis.map((value, index) => <span key={`${value}-${index}`}>{formatCompactCurrency(value)}</span>)}
			</div>
			<div className="dash-chart-plot">
				<div className="dash-chart-grid" aria-hidden="true">
					{yAxis.map((value, index) => <span key={`${value}-${index}`} />)}
				</div>
				<div className="dash-chart-bars">
					{days.map((day) => {
						const isPeak = day.total === maxTotal;
						return (
							<div className="dash-chart-col" key={day.label}>
								<div className="dash-chart-track">
									<div
										className={`dash-chart-bar ${day.isToday ? "is-today" : ""} ${isPeak ? "is-peak" : ""}`.trim()}
										style={{ height: `${Math.max((day.total / maxTotal) * 100, 3)}%` }}
										tabIndex={0}
										aria-label={`${day.label}: ${formatCurrency(day.total)}`}
									>
										<span>{formatCurrency(day.total)}</span>
									</div>
								</div>
								<span className={`dash-chart-label ${day.isToday ? "is-today" : ""}`.trim()}>{day.label}</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default Dashboard;