import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, CalendarDays, FileText, Mail, Phone, Plus, Trash2, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getPOSItems } from "../services/posService";
import { createPurchaseOrder } from "../services/purchaseOrderService";

const formatCurrency = (value) => `N${Number(value || 0).toLocaleString("en-NG")}`;

function CreateOrder() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState([{ itemId: "", quantity: 1, unitPrice: "", notes: "" }]);
  const [form, setForm] = useState({ supplierName: "", supplierEmail: "", supplierPhone: "", supplierAddress: "", expectedDeliveryDate: "", notes: "", internalNotes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getPOSItems()
      .then(setProducts)
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load inventory items"))
      .finally(() => setLoading(false));
  }, []);

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const selectedProducts = useMemo(() => new Map(products.map((product) => [product._id, product])), [products]);
  const subtotal = lines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0);

  const updateLine = (index, field, value) => {
    setLines((current) => current.map((line, lineIndex) => {
      if (lineIndex !== index) return line;
      if (field === "itemId") {
        const product = selectedProducts.get(value);
        return { ...line, itemId: value, unitPrice: product?.price ?? "" };
      }
      return { ...line, [field]: value };
    }));
  };

  const addLine = () => setLines((current) => [...current, { itemId: "", quantity: 1, unitPrice: "", notes: "" }]);
  const removeLine = (index) => setLines((current) => current.length === 1 ? current : current.filter((_, lineIndex) => lineIndex !== index));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const user = JSON.parse(localStorage.getItem("inventory_user") || "null");
    const branchId = user?.branchId;
    if (!branchId) {
      setError("Your account does not have an assigned branch.");
      return;
    }
    if (!form.supplierName.trim() || lines.some((line) => !line.itemId || Number(line.quantity) < 1 || Number(line.unitPrice) < 0)) {
      setError("Add a supplier and complete every order line.");
      return;
    }

    setSaving(true);
    try {
      await createPurchaseOrder({
        branchId,
        ...form,
        items: lines.map((line) => ({ itemId: line.itemId, quantity: Number(line.quantity), unitPrice: Number(line.unitPrice), notes: line.notes })),
      });
      navigate("/pos");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create purchase order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-order-page">
      <header className="create-order-header">
        <Link className="back-button" to="/pos"><ArrowLeft size={15} /> Back to orders</Link>
        <div><p className="pos-kicker">Purchase orders</p><h1>Create new order</h1><p>Send a clear stock request to your supplier.</p></div>
      </header>
      <form onSubmit={handleSubmit}>
        {error && <div className="pos-feedback is-error" role="alert">{error}</div>}
        <div className="create-order-layout">
          <div className="create-order-main">
            <section className="create-order-panel">
              <div className="create-order-panel-heading"><span className="create-order-icon"><Truck size={17} /></span><div><h2>Supplier details</h2><p>Who is this order coming from?</p></div></div>
              <div className="create-order-fields">
                <label>Supplier name<div className="field-with-icon"><Building2 size={15} /><input name="supplierName" value={form.supplierName} onChange={updateForm} placeholder="Supplier or company name" required /></div></label>
                <label>Email <span>(optional)</span><div className="field-with-icon"><Mail size={15} /><input name="supplierEmail" type="email" value={form.supplierEmail} onChange={updateForm} placeholder="supplier@example.com" /></div></label>
                <label>Phone <span>(optional)</span><div className="field-with-icon"><Phone size={15} /><input name="supplierPhone" value={form.supplierPhone} onChange={updateForm} placeholder="+234 801 234 5678" /></div></label>
                <label>Address <span>(optional)</span><input name="supplierAddress" value={form.supplierAddress} onChange={updateForm} placeholder="Supplier address" /></label>
              </div>
            </section>
            <section className="create-order-panel">
              <div className="create-order-panel-heading"><span className="create-order-icon"><FileText size={17} /></span><div><h2>Order items</h2><p>Select the products and quantities you need.</p></div><button type="button" className="add-line-button" onClick={addLine}><Plus size={14} /> Add line</button></div>
              <div className="order-line-list">{lines.map((line, index) => <div className="order-line" key={`${index}-${line.itemId}`}><select value={line.itemId} onChange={(event) => updateLine(index, "itemId", event.target.value)} required><option value="">Select product</option>{products.map((product) => <option key={product._id} value={product._id}>{product.name} ({product.openingQty} in stock)</option>)}</select><input type="number" min="1" value={line.quantity} onChange={(event) => updateLine(index, "quantity", event.target.value)} aria-label="Quantity" /><input type="number" min="0" step="0.01" value={line.unitPrice} onChange={(event) => updateLine(index, "unitPrice", event.target.value)} placeholder="Unit price" aria-label="Unit price" /><strong>{formatCurrency(Number(line.quantity || 0) * Number(line.unitPrice || 0))}</strong><button type="button" className="remove-line-button" onClick={() => removeLine(index)} aria-label="Remove order line"><Trash2 size={14} /></button></div>)}</div>
            </section>
            <section className="create-order-panel create-order-notes"><label>Notes <span>(visible to supplier)</span><textarea name="notes" value={form.notes} onChange={updateForm} rows="4" placeholder="Add delivery or packing instructions" /></label><label>Internal notes <span>(team only)</span><textarea name="internalNotes" value={form.internalNotes} onChange={updateForm} rows="4" placeholder="Add an internal note" /></label></section>
          </div>
          <aside className="create-order-summary"><h2>Order summary</h2><label className="delivery-date">Expected delivery <div className="field-with-icon"><CalendarDays size={15} /><input name="expectedDeliveryDate" type="date" value={form.expectedDeliveryDate} onChange={updateForm} /></div></label><div className="summary-total"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div><button className="save-order-button" type="submit" disabled={loading || saving}>{saving ? "Creating order..." : "Create order"}<ArrowLeft size={16} className="create-order-arrow" /></button><p className="summary-hint">The order will be saved as a draft for review.</p></aside>
        </div>
      </form>
    </div>
  );
}

export default CreateOrder;
