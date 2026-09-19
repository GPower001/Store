import { useEffect, useMemo, useState } from "react";
import {
	AlertTriangle,
	Boxes,
	Check,
	ChevronDown,
	Edit3,
	PackagePlus,
	Plus,
	RefreshCw,
	Search,
	Trash2,
	X,
} from "lucide-react";
import api from "../services/api";

const emptyForm = {
	name: "",
	category: "General",
	itemCode: "",
	price: "",
	costPrice: "",
	openingQty: "0",
	minStock: "0",
	unit: "pcs",
	weightPerUnit: "",
	expiryDate: "",
	description: "",
};

const formatCurrency = (value) => `\u20A6${Number(value || 0).toLocaleString("en-US")}`;

function Inventory() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("all");
	const [form, setForm] = useState(emptyForm);
	const [editingItem, setEditingItem] = useState(null);
	const [showForm, setShowForm] = useState(() => new URLSearchParams(window.location.search).get("add") === "1");
	const [saving, setSaving] = useState(false);
	const [adjustingId, setAdjustingId] = useState(null);
	const [adjustmentItem, setAdjustmentItem] = useState(null);
	const [adjustmentForm, setAdjustmentForm] = useState({ direction: "add", quantity: "", reason: "" });

	const loadItems = async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/items");
			setItems(data.data || []);
			setError("");
		} catch (requestError) {
			setError(requestError.response?.data?.message || "Unable to load inventory");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		let active = true;
		api.get("/items")
			.then(({ data }) => { if (active) setItems(data.data || []); })
			.catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load inventory"); })
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, []);

	const filteredItems = useMemo(() => items.filter((item) => {
		const haystack = `${item.name} ${item.itemCode} ${item.category}`.toLowerCase();
		const matchesQuery = haystack.includes(query.toLowerCase());
		const quantity = Number(item.openingQty || 0);
		const matchesFilter = filter === "all" || (filter === "low" && quantity <= Number(item.minStock || 0) && quantity > 0) || (filter === "out" && quantity === 0);
		return matchesQuery && matchesFilter;
	}), [filter, items, query]);

	const stats = {
		products: items.length,
		units: items.reduce((sum, item) => sum + Number(item.openingQty || 0), 0),
		low: items.filter((item) => Number(item.openingQty || 0) <= Number(item.minStock || 0) && Number(item.openingQty || 0) > 0).length,
		out: items.filter((item) => Number(item.openingQty || 0) === 0).length,
	};

	const openCreate = () => { setEditingItem(null); setForm(emptyForm); setShowForm(true); };
	const openEdit = (item) => {
		setEditingItem(item);
		setForm({ ...emptyForm, ...item, openingQty: String(item.openingQty ?? 0), minStock: String(item.minStock ?? 0), price: String(item.price ?? ""), costPrice: String(item.costPrice ?? ""), weightPerUnit: String(item.weightPerUnit ?? ""), expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : "" });
		setShowForm(true);
	};
	const closeForm = () => { if (!saving) setShowForm(false); };
	const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

	const submitForm = async (event) => {
		event.preventDefault();
		setSaving(true);
		try {
			const payload = { ...form, openingQty: Number(form.openingQty), minStock: Number(form.minStock), price: form.price === "" ? undefined : Number(form.price), costPrice: form.costPrice === "" ? undefined : Number(form.costPrice), weightPerUnit: form.weightPerUnit === "" ? undefined : Number(form.weightPerUnit) };
			const response = editingItem ? await api.patch(`/items/${editingItem._id}`, payload) : await api.post("/items", payload);
			setItems((current) => editingItem ? current.map((item) => item._id === editingItem._id ? response.data.data : item) : [response.data.data, ...current]);
			setShowForm(false);
			setError("");
		} catch (requestError) {
			setError(requestError.response?.data?.message || "Unable to save item");
		} finally { setSaving(false); }
	};

	const openAdjustment = (item) => { setAdjustmentItem(item); setAdjustmentForm({ direction: "add", quantity: "", reason: "" }); };
	const adjustStock = openAdjustment;
	const closeAdjustment = () => { if (!adjustingId) setAdjustmentItem(null); };
	const updateAdjustment = (event) => setAdjustmentForm((current) => ({ ...current, [event.target.name]: event.target.value }));
	const submitAdjustment = async (event) => {
		event.preventDefault();
		const amount = Number(adjustmentForm.quantity);
		const currentQuantity = Number(adjustmentItem.openingQty || 0);
		const nextQuantity = adjustmentForm.direction === "remove" ? currentQuantity - amount : currentQuantity + amount;
		if (!adjustmentItem || !Number.isInteger(amount) || amount < 1 || nextQuantity < 0 || !adjustmentForm.reason.trim()) return;
		setAdjustingId(adjustmentItem._id);
		try {
			const response = await api.post(`/items/${adjustmentItem._id}/adjust-stock`, { quantity: nextQuantity, reason: adjustmentForm.reason.trim(), notes: `${adjustmentForm.direction === "remove" ? "Removed" : "Added"} ${amount} unit(s)` });
			setItems((current) => current.map((entry) => entry._id === adjustmentItem._id ? response.data.data : entry));
			setAdjustmentItem(null);
		} catch (requestError) { setError(requestError.response?.data?.message || "Unable to adjust stock"); }
		finally { setAdjustingId(null); }
	};

	const removeItem = async (item) => {
		if (!window.confirm(`Delete ${item.name} from inventory?`)) return;
		try { await api.delete(`/items/${item._id}`); setItems((current) => current.filter((entry) => entry._id !== item._id)); }
		catch (requestError) { setError(requestError.response?.data?.message || "Unable to delete item"); }
	};

	return <div className="inventory-page">
		<header className="dashboard-heading inventory-heading">
			<div className="dashboard-heading-copy"><p className="panel-kicker">Stock control</p><h1><Boxes size={29} /> Inventory</h1><p className="dashboard-subtitle">Keep every product, quantity, and reorder point in view.</p></div>
			<div className="dashboard-actions"><button className="secondary-action" onClick={loadItems}><RefreshCw size={15} /> Refresh</button><button className="primary-action-dark" onClick={openCreate}><Plus size={16} /> Add product</button></div>
		</header>
		{error && <div className="dashboard-alert" role="alert"><AlertTriangle size={17} /> {error}<button className="inventory-dismiss" onClick={() => setError("")} aria-label="Dismiss error"><X size={14} /></button></div>}
		<section className="inventory-summary" aria-label="Inventory summary"><Summary label="Products" value={stats.products} /><Summary label="Units on hand" value={stats.units.toLocaleString()} /><Summary label="Low stock" value={stats.low} tone="warning" /><Summary label="Out of stock" value={stats.out} tone="danger" /></section>
		<section className="inventory-panel">
			<div className="inventory-toolbar"><label className="inventory-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, codes, categories" /></label><div className="inventory-filters">{[["all", "All products"], ["low", "Low stock"], ["out", "Out of stock"]].map(([value, label]) => <button key={value} className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
			{loading ? <div className="inventory-empty">Loading inventory...</div> : filteredItems.length === 0 ? <div className="inventory-empty"><PackagePlus size={28} /><strong>{items.length ? "No products match these filters" : "Your inventory is empty"}</strong><span>{items.length ? "Try a different search or filter." : "Add your first product to start tracking stock."}</span>{!items.length && <button className="primary-action-dark" onClick={openCreate}><Plus size={15} /> Add product</button>}</div> : <div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>Product</th><th>Category</th><th>On hand</th><th>Price</th><th>Expiry</th><th aria-label="Actions" /></tr></thead><tbody>{filteredItems.map((item) => <InventoryRow key={item._id} item={item} onEdit={openEdit} onAdjust={adjustStock} onDelete={removeItem} adjusting={adjustingId === item._id} />)}</tbody></table></div>}
		</section>
		{showForm && <div className="inventory-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeForm()}><form className="inventory-modal" onSubmit={submitForm}><div className="inventory-modal-header"><div><p className="panel-kicker">{editingItem ? "Edit product" : "New product"}</p><h2>{editingItem ? "Update inventory details" : "Add to inventory"}</h2></div><button type="button" className="icon-button" onClick={closeForm} aria-label="Close"><X size={19} /></button></div><div className="inventory-form-grid"><Field label="Product name" name="name" value={form.name} onChange={updateForm} required /><Field label="Category" name="category" value={form.category} onChange={updateForm} required /><Field label="SKU / Barcode" name="itemCode" value={form.itemCode} onChange={updateForm} placeholder="Auto-generated if blank" /><Field label="Selling price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateForm} required /><Field label="Cost price" name="costPrice" type="number" min="0" step="0.01" value={form.costPrice} onChange={updateForm} required /><Field label="Stock quantity" name="openingQty" type="number" min="0" value={form.openingQty} onChange={updateForm} required /><Field label="Re-order level" name="minStock" type="number" min="0" value={form.minStock} onChange={updateForm} required /><Field label="Expiry date" name="expiryDate" type="date" value={form.expiryDate} onChange={updateForm} /><Field label="Weight per unit" name="weightPerUnit" type="number" min="0" step="0.001" value={form.weightPerUnit} onChange={updateForm} placeholder="e.g. 0.5" /><Field label="Weight unit" name="unit" value={form.unit} onChange={updateForm} placeholder="pcs, kg, litre" /></div><label className="inventory-textarea"><span>Description</span><textarea name="description" value={form.description} onChange={updateForm} rows="3" /></label><div className="inventory-modal-actions"><button type="button" className="secondary-action" onClick={closeForm}>Cancel</button><button className="primary-action-dark" disabled={saving}>{saving ? "Saving..." : <><Check size={15} /> Save product</>}</button></div></form></div>}
		{adjustmentItem && <AdjustmentDialog item={adjustmentItem} form={adjustmentForm} updating={Boolean(adjustingId)} onChange={updateAdjustment} onSubmit={submitAdjustment} onClose={closeAdjustment} />}
	</div>;
}

function Summary({ label, value, tone = "" }) { return <article className={`inventory-summary-card ${tone}`}><span>{label}</span><strong>{value}</strong></article>; }
function Field({ label, ...props }) { return <label className="inventory-field"><span>{label}</span><input {...props} /></label>; }
function AdjustmentDialog({ item, form, updating, onChange, onSubmit, onClose }) { const current = Number(item.openingQty || 0); const amount = Number(form.quantity || 0); const next = form.direction === "remove" ? current - amount : current + amount; return <div className="inventory-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="inventory-modal adjustment-dialog" onSubmit={onSubmit}><div className="inventory-modal-header"><div><p className="panel-kicker">Stock adjustment</p><h2>{item.name}</h2><span className="adjustment-current">Current stock: {current} {item.unit || "units"}</span></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><div className="adjustment-direction"><button type="button" className={form.direction === "add" ? "is-active" : ""} onClick={() => onChange({ target: { name: "direction", value: "add" } })}>Add stock</button><button type="button" className={form.direction === "remove" ? "is-active" : ""} onClick={() => onChange({ target: { name: "direction", value: "remove" } })}>Remove stock</button></div><label className="inventory-field"><span>Number to {form.direction === "remove" ? "remove" : "add"}</span><input name="quantity" type="number" min="1" step="1" value={form.quantity} onChange={onChange} required /></label><label className="inventory-textarea"><span>Reason for {form.direction === "remove" ? "removal" : "addition"}</span><textarea name="reason" value={form.reason} onChange={onChange} rows="3" placeholder="Explain this stock adjustment" required /></label><p className={`adjustment-preview ${next < 0 ? "is-invalid" : ""}`}>New stock level: <strong>{Math.max(0, next)} {item.unit || "units"}</strong>{next < 0 && " (not enough stock)"}</p><div className="inventory-modal-actions"><button type="button" className="secondary-action" onClick={onClose}>Cancel</button><button className="primary-action-dark" disabled={updating || next < 0}>{updating ? "Updating..." : "Save adjustment"}</button></div></form></div>; }
function InventoryRow({ item, onEdit, onAdjust, onDelete, adjusting }) {
	const quantity = Number(item.openingQty || 0); const minimum = Number(item.minStock || 0); const status = quantity === 0 ? "Out of stock" : quantity <= minimum ? "Low stock" : "Healthy";
	return <tr><td><div className="inventory-product"><span className="inventory-product-icon"><Boxes size={16} /></span><div><strong>{item.name}</strong><small>{item.itemCode || "No item code"}</small></div></div></td><td><span className="inventory-category">{item.category || "General"}</span></td><td><div className="inventory-quantity"><strong>{quantity.toLocaleString()} {item.unit || "units"}</strong><span className={`inventory-status ${status.replaceAll(" ", "-").toLowerCase()}`}>{status}</span></div></td><td>{formatCurrency(item.price)}</td><td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : <span className="muted-value">No expiry</span>}</td><td><div className="inventory-row-actions"><button className="row-action" onClick={() => onAdjust(item)} disabled={adjusting} title="Adjust stock"><ChevronDown size={15} /></button><button className="row-action" onClick={() => onEdit(item)} title="Edit product"><Edit3 size={15} /></button><button className="row-action danger-action" onClick={() => onDelete(item)} title="Delete product"><Trash2 size={15} /></button></div></td></tr>;
}

export default Inventory;
