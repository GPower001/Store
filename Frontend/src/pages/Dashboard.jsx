import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Boxes,
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

const formatCurrency = (value) => `\u20A6${Number(value || 0).toLocaleString("en-US")}`;

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
			label: "Healthy",
			count: items.filter((item) => Number(item.openingQty || 0) > Number(item.minStock || 0)).length,
		},
		{
			label: "Low stock",
			count: lowStockItems.length,
		},
		{
			label: "Out of stock",
			count: outOfStockItems.length,
		},
	];
	const maxStockCount = Math.max(...stockLevels.map((level) => level.count), 1);
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
	const inventoryCoverage = items.length ? Math.round(((items.filter((item) => Number(item.openingQty || 0) > Number(item.minStock || 0)).length / items.length) * 100)) : 0;
	const aiInsights = [
		`${inventoryCoverage}% of products are above their minimum stock target.`,
		`${lowStockItems.length} items are approaching a reorder point and may need attention soon.`,
		`${outOfStockItems.length} items are currently unavailable, which could reduce sales this week.`,
	];

	return (
		<div className="dashboard-content">
			<header className="dashboard-heading">
				<div className="dashboard-heading-copy">
					<h1>
						Good {getTimeOfDay()}
						{user?.name ? `, ${formatGreetingName(user.name)}` : ""}
					</h1>
					<p className="dashboard-subtitle">Here's what's happening across your business today.</p>
				</div>
				<div className="dashboard-actions">
					<button className="secondary-action" onClick={() => navigate("/inventory?add=1")}><Plus size={16} /> Add product</button>
					<button className="primary-action-dark" onClick={() => navigate("/pos")}><ShoppingCart size={16} /> Open POS</button>
				</div>
			</header>

			{error && (
				<div className="dashboard-alert" role="alert">
					<CircleAlert size={17} /> Some dashboard data could not be loaded: {error}
				</div>
			)}

			{loading ? (
				<DashboardLoading />
			) : (
				<>
					<section className="metric-grid" aria-label="Business overview">
						<MetricCard
							icon={<TrendingUp size={17} />}
							label="Today's sales"
							infoText="Total value of sales recorded today"
							value={formatCurrency(todaysSales)}
							detail={`${todaysTransactions.toLocaleString()} transaction${todaysTransactions === 1 ? "" : "s"}`}
						/>
						<MetricCard
							icon={<Wallet size={17} />}
							label="Collected today"
							infoText="Cash and payments received today"
							value={formatCurrency(collectedToday)}
							detail="cash received"
						/>
						<MetricCard
							icon={<Clock size={17} />}
							label="Money owed"
							infoText="Total outstanding balance across unpaid invoices"
							value={formatCurrency(moneyOwed)}
							detail="unpaid invoices"
						/>
						<MetricCard
							icon={<Boxes size={17} />}
							label="Products in stock"
							value={productsInStock}
							detail={`${unitsInStock.toLocaleString()} units total`}
						/>
						<MetricCard
							icon={<CircleAlert size={17} />}
							label="Stock alerts"
							value={stockAlerts}
							detail={stockAlerts === 0 ? "All healthy" : `${stockAlerts} item${stockAlerts === 1 ? "" : "s"} need attention`}
						/>
						<MetricCard
							icon={<FileText size={17} />}
							label="Open invoices"
							value={openInvoices}
							detail="draft & issued"
						/>
					</section>

					<section className="dashboard-panel sales-panel">
						<div className="sales-panel-header">
							<h2>Sales · last 7 days</h2>
							<p>Total revenue per day</p>
						</div>
						<SalesChart data={salesByDay} />
					</section>

					<section className="dashboard-grid" aria-label="Inventory overview cards">
						<DashboardCard title="Out of stock" icon={<CircleAlert size={16} />} accent="danger" className="inventory-card">
							{outOfStockItems.length ? (
								<ul className="dashboard-list">
									{outOfStockItems.slice(0, 4).map((item) => (
										<li key={item._id || item.name}>
											<span>{item.name}</span>
											<strong>{Number(item.openingQty || 0)}</strong>
										</li>
									))}
								</ul>
							) : (
								<p className="empty-state">No items are currently out of stock.</p>
							)}
						</DashboardCard>

						<DashboardCard title="Low stock" icon={<CircleAlert size={16} />} accent="warning" className="inventory-card">
							{lowStockItems.length ? (
								<ul className="dashboard-list">
									{lowStockItems.slice(0, 4).map((item) => (
										<li key={item._id || item.name}>
											<span>{item.name}</span>
											<strong>{Number(item.openingQty || 0)}</strong>
										</li>
									))}
								</ul>
							) : (
								<p className="empty-state">No low-stock alerts right now.</p>
							)}
						</DashboardCard>

						<DashboardCard title="Top products today" icon={<TrendingUp size={16} />} accent="success" className="inventory-card ranking-card">
							{topProducts.length ? (
								<ul className="dashboard-list product-list">
									{topProducts.map((product) => (
										<li key={product.name}>
											<div>
												<span className="rank-badge">#{product.rank}</span>
												<strong>{product.name}</strong>
											</div>
											<small>{product.qty} units</small>
										</li>
									))}
								</ul>
							) : (
								<p className="empty-state">Product data is not available yet.</p>
							)}
						</DashboardCard>

						<DashboardCard title="Stock levels" icon={<Boxes size={16} />} accent="neutral" className="inventory-card stock-card">
							<div className="stock-levels">
								{stockLevels.map((level) => (
									<div key={level.label} className="stock-level-row">
										<div className="stock-level-meta">
											<span>{level.label}</span>
											<strong>{level.count}</strong>
										</div>
										<div className="stock-level-bar">
											<span style={{ width: `${(level.count / maxStockCount) * 100}%` }} />
										</div>
									</div>
								))}
							</div>
						</DashboardCard>

						<DashboardCard title="Recent activity" icon={<Clock size={16} />} accent="info" className="wide-card activity-card">
							{recentActivity.length ? (
								<ul className="activity-list">
									{recentActivity.map((activity, index) => (
										<li key={`${activity.title}-${index}`}>
											<span className="activity-dot" aria-hidden="true" />
											<div>
												<strong>{activity.title}</strong>
												<small>{activity.detail}</small>
											</div>
										</li>
									))}
								</ul>
							) : (
								<p className="empty-state">No recent activity available.</p>
							)}
						</DashboardCard>

						<DashboardCard title="AI Business Insights" accent="insight" className="wide-card insight-card">
							<div className="insight-summary">
								<span className="insight-icon"><Sparkles size={17} /></span>
								<p>Clear signals from your inventory, ready for action.</p>
								<span className="insight-status">Live signal</span>
							</div>
							<ul className="insight-list">
								{aiInsights.map((insight, index) => (
									<li key={`${insight}-${index}`}>
										<span className="insight-index">0{index + 1}</span>
										<span>{insight}</span>
									</li>
								))}
							</ul>
						</DashboardCard>
					</section>
				</>
			)}
		</div>
	);
}


function DashboardLoading() {
	return (
		<div className="dashboard-loading">
			<span>Loading live inventory data...</span>
		</div>
	);
}

function DashboardCard({ title, icon, accent, className = "", children }) {
	return (
		<article className={`dashboard-card ${accent} ${className}`.trim()}>
			<div className="dashboard-card-header">
				<div className="dashboard-card-title">
					{icon && <span className="dashboard-card-icon">{icon}</span>}
					<h3>{title}</h3>
				</div>
			</div>
			{children}
		</article>
	);
}

function MetricCard({ icon, label, infoText, value, detail }) {
	return (
		<article className="metric-card">
			<div className="metric-card-header">
				<span className="metric-label">
					{label}
					{infoText && <Info size={12} title={infoText} />}
				</span>
				<span className="metric-icon">{icon}</span>
			</div>
			<strong className="metric-value">{value}</strong>
			<span className="metric-detail">{detail}</span>
		</article>
	);
}

function SalesChart({ data }) {
	const days = Array.from({ length: 7 }).map((_, index) => {
		const date = new Date();
		date.setDate(date.getDate() - (6 - index));
		const match = data.find((entry) => entry.date === dateKey(date));
		return {
			label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
			total: Number(match?.total || 0),
		};
	});

	const maxTotal = Math.max(...days.map((day) => day.total), 1);
	const hasSales = days.some((day) => day.total > 0);

	return (
		<div className="sales-chart">
			<div className="sales-chart-bars">
				{days.map((day) => (
					<div className="sales-chart-column" key={day.label}>
						<div className="sales-chart-track">
							<div
								className="sales-chart-bar"
								style={{ height: hasSales ? `${Math.max((day.total / maxTotal) * 100, 2)}%` : "2%" }}
								title={formatCurrency(day.total)}
							/>
						</div>
						<span>{day.label}</span>
					</div>
				))}
			</div>
		</div>
	);
}

export default Dashboard;