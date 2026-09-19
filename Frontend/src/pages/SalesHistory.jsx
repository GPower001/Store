import { useEffect, useMemo, useState } from "react";
import { ChevronRight, FileText, Printer, Receipt, RefreshCw, X } from "lucide-react";
import { getSale, getSales } from "../services/posService";

const formatCurrency = (value) => `N${Number(value || 0).toLocaleString("en-NG")}`;

function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [status, setStatus] = useState("completed");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSales = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSales({ status, paymentMethod, startDate, endDate, page: 1, limit: 100 });
      setSales(data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load sales history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getSales({ status, paymentMethod, startDate, endDate, page: 1, limit: 100 })
      .then((data) => { if (active) setSales(data.data || []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load sales history"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status, paymentMethod, startDate, endDate]);

  const summary = useMemo(() => sales.reduce((result, sale) => {
    result.count += 1;
    result.total += Number(sale.total || 0);
    return result;
  }, { count: 0, total: 0 }), [sales]);

  const openReceipt = async (id) => {
    try {
      setSelectedSale(await getSale(id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load receipt");
    }
  };

  return (
    <div className="sales-history-page">
      <header className="sales-history-header">
        <div><p className="pos-kicker">Sales</p><h1>Sales history</h1><p>Every completed transaction, ready to review or print.</p></div>
        <button type="button" className="refresh-sales-button" onClick={loadSales} disabled={loading}><RefreshCw size={15} /> Refresh</button>
      </header>

      <section className="sales-summary-strip"><div><small>Transactions</small><strong>{summary.count}</strong></div><div><small>Sales total</small><strong>{formatCurrency(summary.total)}</strong></div><div><small>View</small><strong>{status === "completed" ? "Completed" : "Voided"}</strong></div></section>

      <section className="sales-history-panel">
        <div className="sales-filters"><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="completed">Completed</option><option value="voided">Voided</option><option value="">All statuses</option></select></label><label>Payment<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="">All methods</option><option value="cash">Cash</option><option value="card">Card</option><option value="transfer">Transfer</option></select></label><label>From<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>To<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div>
        {error && <div className="pos-feedback is-error" role="alert">{error}</div>}
        {loading ? <div className="sales-history-empty">Loading sales...</div> : sales.length ? <div className="sales-table-wrap"><table className="sales-table"><thead><tr><th>Transaction</th><th>Time</th><th>Items</th><th>Payment</th><th>Total</th><th /></tr></thead><tbody>{sales.map((sale) => <tr key={sale._id}><td><span className="sale-receipt-icon"><Receipt size={15} /></span><strong>#{sale._id.slice(-6).toUpperCase()}</strong></td><td>{new Date(sale.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</td><td>{sale.items?.reduce((total, item) => total + item.quantity, 0)} units</td><td><span className="payment-badge">{sale.paymentMethod}</span></td><td><strong>{formatCurrency(sale.total)}</strong></td><td><button type="button" className="view-receipt-button" onClick={() => openReceipt(sale._id)}>Receipt <ChevronRight size={14} /></button></td></tr>)}</tbody></table></div> : <div className="sales-history-empty"><FileText size={28} /><strong>No sales found</strong><span>Completed POS transactions will appear here.</span></div>}
      </section>

      {selectedSale && <ReceiptModal sale={selectedSale} onClose={() => setSelectedSale(null)} />}
    </div>
  );
}

function ReceiptModal({ sale, onClose }) {
  return <div className="receipt-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="receipt-modal" role="dialog" aria-modal="true" aria-labelledby="receipt-title"><div className="receipt-toolbar"><span>Receipt preview</span><div><button type="button" onClick={() => window.print()} aria-label="Print receipt"><Printer size={16} /></button><button type="button" onClick={onClose} aria-label="Close receipt"><X size={17} /></button></div></div><div className="receipt-paper" id="receipt-title"><div className="receipt-brand"><strong>Stock<span>Room</span></strong><small>Sales receipt</small></div><div className="receipt-meta"><span>Transaction <b>#{sale._id.slice(-6).toUpperCase()}</b></span><span>{new Date(sale.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span></div><div className="receipt-items">{sale.items.map((item) => <div key={item.itemId}><span>{item.quantity} x {item.name}<small>{formatCurrency(item.unitPrice)} each</small></span><b>{formatCurrency(item.total)}</b></div>)}</div><div className="receipt-totals"><span>Subtotal <b>{formatCurrency(sale.subtotal)}</b></span><span>Discount <b>-{formatCurrency(sale.discount)}</b></span><strong>Total <b>{formatCurrency(sale.total)}</b></strong></div><div className="receipt-footer"><span>Payment: {sale.paymentMethod}</span><small>Thank you for your business.</small></div></div></section></div>;
}

export default SalesHistory;
