// import { useEffect, useMemo, useState } from "react";
// import { ArrowLeft, Building2, CalendarDays, FileText, Mail, Phone, Plus, Trash2, Truck } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import { getPOSItems } from "../services/posService";
// import { createPurchaseOrder } from "../services/purchaseOrderService";

// const formatCurrency = (value) => `N${Number(value || 0).toLocaleString("en-NG")}`;

// function CreateOrder() {
//   const navigate = useNavigate();
//   const [products, setProducts] = useState([]);
//   const [lines, setLines] = useState([{ itemId: "", quantity: 1, unitPrice: "", notes: "" }]);
//   const [form, setForm] = useState({ supplierName: "", supplierEmail: "", supplierPhone: "", supplierAddress: "", expectedDeliveryDate: "", notes: "", internalNotes: "" });
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     getPOSItems()
//       .then(setProducts)
//       .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load inventory items"))
//       .finally(() => setLoading(false));
//   }, []);

//   const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
//   const selectedProducts = useMemo(() => new Map(products.map((product) => [product._id, product])), [products]);
//   const subtotal = lines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0);

//   const updateLine = (index, field, value) => {
//     setLines((current) => current.map((line, lineIndex) => {
//       if (lineIndex !== index) return line;
//       if (field === "itemId") {
//         const product = selectedProducts.get(value);
//         return { ...line, itemId: value, unitPrice: product?.price ?? "" };
//       }
//       return { ...line, [field]: value };
//     }));
//   };

//   const addLine = () => setLines((current) => [...current, { itemId: "", quantity: 1, unitPrice: "", notes: "" }]);
//   const removeLine = (index) => setLines((current) => current.length === 1 ? current : current.filter((_, lineIndex) => lineIndex !== index));

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setError("");
//     const user = JSON.parse(localStorage.getItem("inventory_user") || "null");
//     const branchId = user?.branchId;
//     if (!branchId) {
//       setError("Your account does not have an assigned branch.");
//       return;
//     }
//     if (!form.supplierName.trim() || lines.some((line) => !line.itemId || Number(line.quantity) < 1 || Number(line.unitPrice) < 0)) {
//       setError("Add a supplier and complete every order line.");
//       return;
//     }

//     setSaving(true);
//     try {
//       await createPurchaseOrder({
//         branchId,
//         ...form,
//         items: lines.map((line) => ({ itemId: line.itemId, quantity: Number(line.quantity), unitPrice: Number(line.unitPrice), notes: line.notes })),
//       });
//       navigate("/pos");
//     } catch (requestError) {
//       setError(requestError.response?.data?.message || "Unable to create purchase order");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="create-order-page">
//       <header className="create-order-header">
//         <Link className="back-button" to="/pos"><ArrowLeft size={15} /> Back to orders</Link>
//         <div><p className="pos-kicker">Purchase orders</p><h1>Create new order</h1><p>Send a clear stock request to your supplier.</p></div>
//       </header>
//       <form onSubmit={handleSubmit}>
//         {error && <div className="pos-feedback is-error" role="alert">{error}</div>}
//         <div className="create-order-layout">
//           <div className="create-order-main">
//             <section className="create-order-panel">
//               <div className="create-order-panel-heading"><span className="create-order-icon"><Truck size={17} /></span><div><h2>Supplier details</h2><p>Who is this order coming from?</p></div></div>
//               <div className="create-order-fields">
//                 <label>Supplier name<div className="field-with-icon"><Building2 size={15} /><input name="supplierName" value={form.supplierName} onChange={updateForm} placeholder="Supplier or company name" required /></div></label>
//                 <label>Email <span>(optional)</span><div className="field-with-icon"><Mail size={15} /><input name="supplierEmail" type="email" value={form.supplierEmail} onChange={updateForm} placeholder="supplier@example.com" /></div></label>
//                 <label>Phone <span>(optional)</span><div className="field-with-icon"><Phone size={15} /><input name="supplierPhone" value={form.supplierPhone} onChange={updateForm} placeholder="+234 801 234 5678" /></div></label>
//                 <label>Address <span>(optional)</span><input name="supplierAddress" value={form.supplierAddress} onChange={updateForm} placeholder="Supplier address" /></label>
//               </div>
//             </section>
//             <section className="create-order-panel">
//               <div className="create-order-panel-heading"><span className="create-order-icon"><FileText size={17} /></span><div><h2>Order items</h2><p>Select the products and quantities you need.</p></div><button type="button" className="add-line-button" onClick={addLine}><Plus size={14} /> Add line</button></div>
//               <div className="order-line-list">{lines.map((line, index) => <div className="order-line" key={`${index}-${line.itemId}`}><select value={line.itemId} onChange={(event) => updateLine(index, "itemId", event.target.value)} required><option value="">Select product</option>{products.map((product) => <option key={product._id} value={product._id}>{product.name} ({product.openingQty} in stock)</option>)}</select><input type="number" min="1" value={line.quantity} onChange={(event) => updateLine(index, "quantity", event.target.value)} aria-label="Quantity" /><input type="number" min="0" step="0.01" value={line.unitPrice} onChange={(event) => updateLine(index, "unitPrice", event.target.value)} placeholder="Unit price" aria-label="Unit price" /><strong>{formatCurrency(Number(line.quantity || 0) * Number(line.unitPrice || 0))}</strong><button type="button" className="remove-line-button" onClick={() => removeLine(index)} aria-label="Remove order line"><Trash2 size={14} /></button></div>)}</div>
//             </section>
//             <section className="create-order-panel create-order-notes"><label>Notes <span>(visible to supplier)</span><textarea name="notes" value={form.notes} onChange={updateForm} rows="4" placeholder="Add delivery or packing instructions" /></label><label>Internal notes <span>(team only)</span><textarea name="internalNotes" value={form.internalNotes} onChange={updateForm} rows="4" placeholder="Add an internal note" /></label></section>
//           </div>
//           <aside className="create-order-summary"><h2>Order summary</h2><label className="delivery-date">Expected delivery <div className="field-with-icon"><CalendarDays size={15} /><input name="expectedDeliveryDate" type="date" value={form.expectedDeliveryDate} onChange={updateForm} /></div></label><div className="summary-total"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div><button className="save-order-button" type="submit" disabled={loading || saving}>{saving ? "Creating order..." : "Create order"}<ArrowLeft size={16} className="create-order-arrow" /></button><p className="summary-hint">The order will be saved as a draft for review.</p></aside>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default CreateOrder;

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CalendarDays, FileText, Mail, Phone, Plus, Trash2, Truck } from "lucide-react";
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
    <div className="co">
      <header className="co-hero">
        <div className="co-hero-copy">
          <Link className="co-back-link" to="/pos">
            <ArrowLeft size={16} /> Back to orders
          </Link>
          <p className="co-date">Purchase orders</p>
          <h1>Create new order</h1>
          <p className="co-hero-sub">Send a clear stock request to your supplier.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="co-form">
        {error && (
          <div className="co-alert" role="alert">
            <FileText size={18} /> {error}
          </div>
        )}

        <div className="co-layout">
          <div className="co-main">
            {/* Supplier details */}
            <section className="co-panel">
              <div className="co-panel-head">
                <span className="co-panel-icon"><Truck size={20} /></span>
                <div>
                  <h2>Supplier details</h2>
                  <p>Who is this order coming from?</p>
                </div>
              </div>
              <div className="co-fields">
                <label className="co-field co-field-full">
                  <span>Supplier name</span>
                  <div className="co-field-with-icon">
                    <Building2 size={16} />
                    <input name="supplierName" value={form.supplierName} onChange={updateForm} placeholder="Supplier or company name" required />
                  </div>
                </label>
                <label className="co-field">
                  <span>Email <em>(optional)</em></span>
                  <div className="co-field-with-icon">
                    <Mail size={16} />
                    <input name="supplierEmail" type="email" value={form.supplierEmail} onChange={updateForm} placeholder="supplier@example.com" />
                  </div>
                </label>
                <label className="co-field">
                  <span>Phone <em>(optional)</em></span>
                  <div className="co-field-with-icon">
                    <Phone size={16} />
                    <input name="supplierPhone" value={form.supplierPhone} onChange={updateForm} placeholder="+234 801 234 5678" />
                  </div>
                </label>
                <label className="co-field co-field-full">
                  <span>Address <em>(optional)</em></span>
                  <input name="supplierAddress" value={form.supplierAddress} onChange={updateForm} placeholder="Supplier address" />
                </label>
              </div>
            </section>

            {/* Order items */}
            <section className="co-panel">
              <div className="co-panel-head">
                <span className="co-panel-icon"><FileText size={20} /></span>
                <div>
                  <h2>Order items</h2>
                  <p>Select the products and quantities you need.</p>
                </div>
                <button type="button" className="co-btn co-btn-light co-add-line" onClick={addLine}>
                  <Plus size={16} /> Add line
                </button>
              </div>

              {loading ? (
                <div className="co-loading" role="status">
                  <span className="co-spinner" aria-hidden="true" />
                  <span>Loading products...</span>
                </div>
              ) : (
                <div className="co-lines">
                  {lines.map((line, index) => (
                    <div className="co-line" key={`${index}-${line.itemId}`}>
                      <label className="co-line-product">
                        <span>Product</span>
                        <select value={line.itemId} onChange={(event) => updateLine(index, "itemId", event.target.value)} required>
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>{product.name} ({product.openingQty} in stock)</option>
                          ))}
                        </select>
                      </label>
                      <label className="co-line-qty">
                        <span>Qty</span>
                        <input type="number" min="1" value={line.quantity} onChange={(event) => updateLine(index, "quantity", event.target.value)} aria-label="Quantity" />
                      </label>
                      <label className="co-line-price">
                        <span>Unit price</span>
                        <input type="number" min="0" step="0.01" value={line.unitPrice} onChange={(event) => updateLine(index, "unitPrice", event.target.value)} placeholder="0.00" aria-label="Unit price" />
                      </label>
                      <div className="co-line-total">
                        <span>Total</span>
                        <strong>{formatCurrency(Number(line.quantity || 0) * Number(line.unitPrice || 0))}</strong>
                      </div>
                      <button type="button" className="co-line-remove" onClick={() => removeLine(index)} aria-label="Remove order line">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Notes */}
            <section className="co-panel co-notes">
              <label className="co-field co-field-full">
                <span>Notes <em>(visible to supplier)</em></span>
                <textarea name="notes" value={form.notes} onChange={updateForm} rows="4" placeholder="Add delivery or packing instructions" />
              </label>
              <label className="co-field co-field-full">
                <span>Internal notes <em>(team only)</em></span>
                <textarea name="internalNotes" value={form.internalNotes} onChange={updateForm} rows="4" placeholder="Add an internal note" />
              </label>
            </section>
          </div>

          {/* Summary sidebar */}
          <aside className="co-summary">
            <h2>Order summary</h2>

            <label className="co-field co-field-full">
              <span>Expected delivery</span>
              <div className="co-field-with-icon">
                <CalendarDays size={16} />
                <input name="expectedDeliveryDate" type="date" value={form.expectedDeliveryDate} onChange={updateForm} />
              </div>
            </label>

            <div className="co-summary-total">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>

            <button className="co-btn co-btn-blue co-save" type="submit" disabled={loading || saving}>
              {saving ? "Creating order..." : "Create order"}
              <ArrowRight size={17} />
            </button>

            <p className="co-summary-hint">The order will be saved as a draft for review.</p>
          </aside>
        </div>
      </form>
    </div>
  );
}

export default CreateOrder;