import { useEffect, useMemo, useState } from "react";
import {
	AlertTriangle,
	BarChart3,
	Boxes,
	Download,
	PackageCheck,
	RefreshCw,
	TrendingUp,
	XCircle,
} from "lucide-react";
import {
	downloadInventoryReport,
	getCategoryAnalysis,
	getInventoryValuation,
	getStockTrends,
} from "../services/reportService";

const formatCurrency = (value) => `\u20A6${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;

const fetchReports = (filters) => Promise.all([
	getInventoryValuation(filters),
	getStockTrends(filters),
	getCategoryAnalysis(filters),
]);

function Reports() {
	const [filters, setFilters] = useState({ category: "", startDate: "", endDate: "" });
	const [valuation, setValuation] = useState(null);
	const [stock, setStock] = useState(null);
	const [categories, setCategories] = useState(null);
	const [loading, setLoading] = useState(true);
	const [exporting, setExporting] = useState(false);
	const [error, setError] = useState("");
	const reportParams = useMemo(() => ({ category: filters.category, startDate: filters.startDate, endDate: filters.endDate }), [filters.category, filters.startDate, filters.endDate]);

	const loadReports = async () => {
		setLoading(true);
		setError("");
		try {
			const [valuationData, stockData, categoryData] = await fetchReports(reportParams);
			setValuation(valuationData);
			setStock(stockData);
			setCategories(categoryData);
		} catch (requestError) {
			setError(requestError.response?.data?.message || "Unable to load reports");
		} finally {
			setLoading(false);
		}
	};

	const updateFilter = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
	const resetFilters = () => setFilters({ category: "", startDate: "", endDate: "" });

	useEffect(() => {
		let active = true;
		const timer = window.setTimeout(() => {
			fetchReports(reportParams)
				.then(([valuationData, stockData, categoryData]) => {
					if (!active) return;
					setValuation(valuationData);
					setStock(stockData);
					setCategories(categoryData);
					setError("");
				})
				.catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load reports"); })
				.finally(() => { if (active) setLoading(false); });
		}, 0);
		return () => { active = false; window.clearTimeout(timer); };
	}, [reportParams]);

	const categoryBars = useMemo(() => (categories?.categories || []).slice(0, 6), [categories]);
	const maxCategoryValue = Math.max(...categoryBars.map((category) => Number(category.totalValue || 0)), 1);
	const alerts = [
		...(stock?.stockAlerts?.critical || []).map((item) => ({ ...item, tone: "critical", label: "Out of stock" })),
		...(stock?.stockAlerts?.warning || []).map((item) => ({ ...item, tone: "warning", label: "Low stock" })),
	].slice(0, 8);

	const exportReport = async () => {
		setExporting(true);
		try {
			const blob = await downloadInventoryReport();
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "inventory-report.csv";
			link.click();
			URL.revokeObjectURL(url);
		} catch (requestError) {
			setError(requestError.response?.data?.message || "Unable to export report");
		} finally {
			setExporting(false);
		}
	};

	return <div className="reports-page">
		<header className="dashboard-heading reports-heading">
			<div className="dashboard-heading-copy"><p className="panel-kicker">Business intelligence</p><h1><BarChart3 size={29} /> Reports</h1><p className="dashboard-subtitle">Understand stock value, category mix, and the products that need attention.</p></div>
			<div className="dashboard-actions"><button className="secondary-action" onClick={loadReports} disabled={loading}><RefreshCw size={15} /> Refresh</button><button className="primary-action-dark" onClick={exportReport} disabled={exporting}><Download size={15} /> {exporting ? "Exporting..." : "Export CSV"}</button></div>
		</header>
		<section className="reports-filters" aria-label="Report filters"><label><span>Category</span><select name="category" value={filters.category} onChange={updateFilter}><option value="">All categories</option><option value="General">General</option><option value="Consumables">Consumables</option><option value="Medications">Medications</option></select></label><label><span>From</span><input name="startDate" type="date" value={filters.startDate} onChange={updateFilter} /></label><label><span>To</span><input name="endDate" type="date" value={filters.endDate} onChange={updateFilter} /></label>{(filters.category || filters.startDate || filters.endDate) && <button className="report-reset" onClick={resetFilters}><XCircle size={15} /> Clear filters</button>}</section>
		{error && <div className="dashboard-alert" role="alert"><AlertTriangle size={17} /> {error}</div>}
		{loading && !valuation ? <div className="dashboard-loading">Loading reports...</div> : <>
			<section className="reports-metrics" aria-label="Report summary"><ReportMetric label="Inventory value" value={formatCurrency(valuation?.summary?.totalValue)} icon={<TrendingUp size={17} />} /><ReportMetric label="Products" value={valuation?.summary?.totalItems || 0} icon={<Boxes size={17} />} /><ReportMetric label="Units on hand" value={Number(valuation?.summary?.totalQuantity || 0).toLocaleString()} icon={<PackageCheck size={17} />} /><ReportMetric label="Stock alerts" value={(stock?.summary?.outOfStock || 0) + (stock?.summary?.lowStock || 0)} icon={<AlertTriangle size={17} />} /></section>
			<section className="reports-grid"><article className="report-panel report-category-panel"><div className="report-panel-heading"><div><p className="section-kicker">Value distribution</p><h2>Inventory by category</h2></div><span>{categories?.summary?.totalCategories || 0} categories</span></div>{categoryBars.length ? <div className="category-bars">{categoryBars.map((category) => <div className="category-bar-row" key={category.category}><div className="category-bar-meta"><strong>{category.category}</strong><span>{formatCurrency(category.totalValue)}</span></div><div className="category-bar-track"><span style={{ width: `${(Number(category.totalValue || 0) / maxCategoryValue) * 100}%` }} /></div><small>{category.itemCount} products · {Number(category.totalQuantity || 0).toLocaleString()} units</small></div>)}</div> : <ReportEmpty text="No category data available for this range." />}</article><article className="report-panel report-alert-panel"><div className="report-panel-heading"><div><p className="section-kicker">Action queue</p><h2>Stock health</h2></div><span>{alerts.length} alerts</span></div><div className="report-alert-list">{alerts.length ? alerts.map((item) => <div className="report-alert-row" key={`${item._id}-${item.label}`}><span className={`report-alert-icon ${item.tone}`}>{item.tone === "critical" ? <XCircle size={15} /> : <AlertTriangle size={15} />}</span><div><strong>{item.name}</strong><small>{item.label} · {item.currentStock} units remaining · reorder at {item.minStock}</small></div></div>) : <ReportEmpty text="All products are within healthy stock levels." />}</div></article></section>
			<section className="report-panel report-table-panel"><div className="report-panel-heading"><div><p className="section-kicker">Detailed valuation</p><h2>Highest-value products</h2></div><span>{valuation?.items?.length || 0} products</span></div><div className="reports-table-wrap"><table className="reports-table"><thead><tr><th>Product</th><th>Category</th><th>Units</th><th>Selling price</th><th>Stock value</th></tr></thead><tbody>{(valuation?.items || []).sort((a, b) => Number(b.value || 0) - Number(a.value || 0)).slice(0, 10).map((item) => <tr key={item._id}><td><strong>{item.name}</strong><small>{item.branch}</small></td><td>{item.category}</td><td>{Number(item.quantity || 0).toLocaleString()}</td><td>{formatCurrency(item.price)}</td><td><strong>{formatCurrency(item.value)}</strong></td></tr>)}</tbody></table>{!valuation?.items?.length && <ReportEmpty text="No products available for this report." />}</div></section>
		</>}
	</div>;
}

function ReportMetric({ label, value, icon }) { return <article className="report-metric"><div><span>{label}</span><strong>{value}</strong></div><i>{icon}</i></article>; }
function ReportEmpty({ text }) { return <p className="report-empty">{text}</p>; }

export default Reports;
