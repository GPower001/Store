import { useEffect, useMemo, useRef, useState } from "react";
import {
	AlertTriangle,
	Boxes,
	Check,
	ChevronDown,
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
	const [categoryOpen, setCategoryOpen] = useState(false);
	const categoryPickerRef = useRef(null);
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
	const categoryOptions = useMemo(() => {
		const categoryValues = [
			...(categories?.categories || []).map((category) => category.category),
			...(valuation?.byCategory || []).map((category) => category.category),
			...(valuation?.items || []).map((item) => item.category),
		].filter((category) => typeof category === "string" && category.trim());
		const uniqueCategories = new Map();

		categoryValues.forEach((category) => {
			const trimmedCategory = category.trim();
			const normalizedCategory = trimmedCategory.toLocaleLowerCase();
			if (!uniqueCategories.has(normalizedCategory)) uniqueCategories.set(normalizedCategory, trimmedCategory);
		});

		return [...uniqueCategories.values()].sort((a, b) => a.localeCompare(b));
	}, [categories, valuation]);
	useEffect(() => {
		if (!categoryOpen) return undefined;
		const closePicker = (event) => {
			if (!categoryPickerRef.current?.contains(event.target)) setCategoryOpen(false);
		};
		const closeOnEscape = (event) => {
			if (event.key === "Escape") setCategoryOpen(false);
		};
		document.addEventListener("mousedown", closePicker);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("mousedown", closePicker);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [categoryOpen]);
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

	const hasActiveFilters = filters.category || filters.startDate || filters.endDate;

	return (
		<div className="rep">
			<header className="rep-hero">
				<div className="rep-hero-copy">
					<p className="rep-date">Business intelligence</p>
					<h1>Reports</h1>
					<p className="rep-hero-sub">Understand stock value, category mix, and the products that need attention.</p>
				</div>
				<div className="rep-hero-actions">
					<button type="button" className="rep-btn rep-btn-light" onClick={loadReports} disabled={loading}>
						<RefreshCw size={18} /> Refresh
					</button>
					<button type="button" className="rep-btn rep-btn-blue" onClick={exportReport} disabled={exporting}>
						<Download size={18} /> {exporting ? "Exporting..." : "Export CSV"}
					</button>
				</div>
			</header>

			<section className="rep-filters" aria-label="Report filters">
				<label className="rep-filter-field">
					<span>Category</span>
					<div className={`rep-category-picker${categoryOpen ? " is-open" : ""}`} ref={categoryPickerRef}>
						<button
							type="button"
							className="rep-category-trigger"
							aria-haspopup="listbox"
							aria-expanded={categoryOpen}
							onClick={() => setCategoryOpen((open) => !open)}
						>
							<span className={!filters.category ? "is-placeholder" : ""}>{filters.category || "All categories"}</span>
							<ChevronDown size={18} aria-hidden="true" />
						</button>
						{categoryOpen && (
							<div className="rep-category-menu" role="listbox" aria-label="Categories">
								<button type="button" role="option" aria-selected={!filters.category} className={!filters.category ? "is-selected" : ""} onClick={() => { setFilters((current) => ({ ...current, category: "" })); setCategoryOpen(false); }}>
									<span className="rep-category-dot all" /> All categories {!filters.category && <Check size={16} />}
								</button>
								{categoryOptions.map((category, index) => (
									<button type="button" role="option" aria-selected={filters.category === category} className={filters.category === category ? "is-selected" : ""} key={category} onClick={() => { setFilters((current) => ({ ...current, category })); setCategoryOpen(false); }}>
										<span className={`rep-category-dot tone-${index % 4}`} /> {category} {filters.category === category && <Check size={16} />}
									</button>
								))}
							</div>
						)}
					</div>
				</label>
				<label className="rep-filter-field">
					<span>From</span>
					<input name="startDate" type="date" value={filters.startDate} onChange={updateFilter} />
				</label>
				<label className="rep-filter-field">
					<span>To</span>
					<input name="endDate" type="date" value={filters.endDate} onChange={updateFilter} />
				</label>
				{hasActiveFilters && (
					<button type="button" className="rep-reset" onClick={resetFilters}>
						<XCircle size={16} /> Clear filters
					</button>
				)}
			</section>

			{error && (
				<div className="rep-alert" role="alert">
					<AlertTriangle size={18} /> {error}
				</div>
			)}

			{loading && !valuation ? (
				<div className="rep-loading" role="status">
					<span className="rep-spinner" aria-hidden="true" />
					<span>Loading reports...</span>
				</div>
			) : (
				<>
					<section className="rep-metrics" aria-label="Report summary">
						<ReportMetric label="Inventory value" value={formatCurrency(valuation?.summary?.totalValue)} icon={<TrendingUp size={22} />} tone="mint" />
						<ReportMetric label="Products" value={valuation?.summary?.totalItems || 0} icon={<Boxes size={22} />} tone="sky" />
						<ReportMetric label="Units on hand" value={Number(valuation?.summary?.totalQuantity || 0).toLocaleString()} icon={<PackageCheck size={22} />} tone="sun" />
						<ReportMetric label="Stock alerts" value={(stock?.summary?.outOfStock || 0) + (stock?.summary?.lowStock || 0)} icon={<AlertTriangle size={22} />} tone="pink" />
					</section>

					<section className="rep-grid">
						<article className="rep-panel">
							<header className="rep-panel-head">
								<div>
									<p className="rep-kicker">Value distribution</p>
									<h2>Inventory by category</h2>
								</div>
								<span className="rep-badge">{categories?.summary?.totalCategories || 0} categories</span>
							</header>
							{categoryBars.length ? (
								<div className="rep-category-bars">
									{categoryBars.map((category) => (
										<div className="rep-category-row" key={category.category}>
											<div className="rep-category-meta">
												<strong>{category.category}</strong>
												<span>{formatCurrency(category.totalValue)}</span>
											</div>
											<div className="rep-category-track">
												<span style={{ width: `${(Number(category.totalValue || 0) / maxCategoryValue) * 100}%` }} />
											</div>
											<small>{category.itemCount} products · {Number(category.totalQuantity || 0).toLocaleString()} units</small>
										</div>
									))}
								</div>
							) : (
								<ReportEmpty text="No category data available for this range." />
							)}
						</article>

						<article className="rep-panel">
							<header className="rep-panel-head">
								<div>
									<p className="rep-kicker">Action queue</p>
									<h2>Stock health</h2>
								</div>
								<span className="rep-badge">{alerts.length} alerts</span>
							</header>
							<div className="rep-alert-list">
								{alerts.length ? (
									alerts.map((item) => (
										<div className="rep-alert-row" key={`${item._id}-${item.label}`}>
											<span className={`rep-alert-icon ${item.tone}`}>
												{item.tone === "critical" ? <XCircle size={16} /> : <AlertTriangle size={16} />}
											</span>
											<div>
												<strong>{item.name}</strong>
												<small>{item.label} · {item.currentStock} units remaining · reorder at {item.minStock}</small>
											</div>
										</div>
									))
								) : (
									<ReportEmpty text="All products are within healthy stock levels." />
								)}
							</div>
						</article>
					</section>

					<section className="rep-panel">
						<header className="rep-panel-head">
							<div>
								<p className="rep-kicker">Detailed valuation</p>
								<h2>Highest-value products</h2>
							</div>
							<span className="rep-badge">{valuation?.items?.length || 0} products</span>
						</header>
						<div className="rep-table-wrap">
							<table className="rep-table">
								<thead>
									<tr>
										<th>Product</th>
										<th>Category</th>
										<th>Units</th>
										<th>Selling price</th>
										<th>Stock value</th>
									</tr>
								</thead>
								<tbody>
									{(valuation?.items || [])
										.sort((a, b) => Number(b.value || 0) - Number(a.value || 0))
										.slice(0, 10)
										.map((item) => (
											<tr key={item._id}>
												<td>
													<strong>{item.name}</strong>
													<small>{item.branch}</small>
												</td>
												<td>{item.category}</td>
												<td>{Number(item.quantity || 0).toLocaleString()}</td>
												<td>{formatCurrency(item.price)}</td>
												<td><strong>{formatCurrency(item.value)}</strong></td>
											</tr>
										))}
								</tbody>
							</table>
							{!valuation?.items?.length && <ReportEmpty text="No products available for this report." />}
						</div>
					</section>
				</>
			)}
		</div>
	);
}

function ReportMetric({ label, value, icon, tone = "sky" }) {
	return (
		<article className={`rep-metric tone-${tone}`}>
			<div className="rep-metric-head">
				<span className="rep-metric-label">{label}</span>
				<span className="rep-metric-icon">{icon}</span>
			</div>
			<strong className="rep-metric-value">{value}</strong>
		</article>
	);
}

function ReportEmpty({ text }) {
	return <p className="rep-empty">{text}</p>;
}

export default Reports;