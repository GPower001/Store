import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, FileText, Printer, Receipt, RefreshCw, X } from "lucide-react";
import { getSale, getSales } from "../services/posService";

const formatCurrency = (value) => `N${Number(value || 0).toLocaleString("en-NG")}`;

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "voided", label: "Voided" },
  { value: "", label: "All statuses" },
];

const PAYMENT_OPTIONS = [
  { value: "", label: "All methods" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "transfer", label: "Transfer" },
];

function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [status, setStatus] = useState("completed");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const statusPickerRef = useRef(null);
  const paymentPickerRef = useRef(null);

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

  /* Close pickers on outside click / Escape — same behavior as Reports */
  useEffect(() => {
    if (!statusOpen && !paymentOpen) return undefined;
    const closePickers = (event) => {
      if (statusPickerRef.current && !statusPickerRef.current.contains(event.target)) setStatusOpen(false);
      if (paymentPickerRef.current && !paymentPickerRef.current.contains(event.target)) setPaymentOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") { setStatusOpen(false); setPaymentOpen(false); }
    };
    document.addEventListener("mousedown", closePickers);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closePickers);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [statusOpen, paymentOpen]);

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

  const currentStatusLabel = STATUS_OPTIONS.find((opt) => opt.value === status)?.label || "All statuses";
  const currentPaymentLabel = PAYMENT_OPTIONS.find((opt) => opt.value === paymentMethod)?.label || "All methods";

  return (
    <div className="sh">
      <header className="sh-hero">
        <div className="sh-hero-copy">
          <p className="sh-date">Sales</p>
          <h1>Sales history</h1>
          <p className="sh-hero-sub">Every completed transaction, ready to review or print.</p>
        </div>
        <div className="sh-hero-actions">
          <button type="button" className="sh-btn sh-btn-light" onClick={loadSales} disabled={loading}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </header>

      <section className="sh-metrics" aria-label="Sales summary">
        <Metric label="Transactions" value={summary.count} tone="sky" icon={<Receipt size={22} />} />
        <Metric label="Sales total" value={formatCurrency(summary.total)} tone="mint" icon={<FileText size={22} />} />
        <Metric label="View" value={status === "completed" ? "Completed" : status === "voided" ? "Voided" : "All"} tone="sun" icon={<ChevronRight size={22} />} />
      </section>

      <section className="sh-panel" aria-label="Sales list">
        <div className="sh-panel-head">
          <div>
            <h2>Transactions</h2>
            <p>{sales.length} {sales.length === 1 ? "sale" : "sales"} shown</p>
          </div>
          <div className="sh-filters">
            {/* Status — custom picker (Reports style) */}
            <label className="sh-filter-field">
              <span>Status</span>
              <div className={`sh-picker${statusOpen ? " is-open" : ""}`} ref={statusPickerRef}>
                <button
                  type="button"
                  className="sh-picker-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={statusOpen}
                  onClick={() => setStatusOpen((open) => !open)}
                >
                  <span className={status === "" ? "is-placeholder" : ""}>{currentStatusLabel}</span>
                  <ChevronDown size={18} aria-hidden="true" />
                </button>
                {statusOpen && (
                  <div className="sh-picker-menu" role="listbox" aria-label="Status">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={status === opt.value}
                        className={status === opt.value ? "is-selected" : ""}
                        key={opt.value || "all"}
                        onClick={() => { setStatus(opt.value); setStatusOpen(false); }}
                      >
                        <span className={`sh-picker-dot status-${opt.value || "all"}`} />
                        {opt.label}
                        {status === opt.value && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </label>

            {/* Payment — custom picker (Reports style) */}
            <label className="sh-filter-field">
              <span>Payment</span>
              <div className={`sh-picker${paymentOpen ? " is-open" : ""}`} ref={paymentPickerRef}>
                <button
                  type="button"
                  className="sh-picker-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={paymentOpen}
                  onClick={() => setPaymentOpen((open) => !open)}
                >
                  <span className={paymentMethod === "" ? "is-placeholder" : ""}>{currentPaymentLabel}</span>
                  <ChevronDown size={18} aria-hidden="true" />
                </button>
                {paymentOpen && (
                  <div className="sh-picker-menu" role="listbox" aria-label="Payment method">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={paymentMethod === opt.value}
                        className={paymentMethod === opt.value ? "is-selected" : ""}
                        key={opt.value || "all"}
                        onClick={() => { setPaymentMethod(opt.value); setPaymentOpen(false); }}
                      >
                        <span className={`sh-picker-dot payment-${opt.value || "all"}`} />
                        {opt.label}
                        {paymentMethod === opt.value && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </label>

            {/* Dates remain native inputs */}
            <label className="sh-filter-field">
              <span>From</span>
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </label>
            <label className="sh-filter-field">
              <span>To</span>
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </label>
          </div>
        </div>

        {error && (
          <div className="sh-alert" role="alert">
            <FileText size={18} /> {error}
          </div>
        )}

        {loading ? (
          <div className="sh-loading" role="status">
            <span className="sh-spinner" aria-hidden="true" />
            <span>Loading sales...</span>
          </div>
        ) : sales.length ? (
          <div className="sh-table-wrap">
            <table className="sh-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Time</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td>
                      <span className="sh-receipt-icon"><Receipt size={16} /></span>
                      <strong>#{sale._id.slice(-6).toUpperCase()}</strong>
                    </td>
                    <td>{new Date(sale.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td>{sale.items?.reduce((total, item) => total + item.quantity, 0)} units</td>
                    <td><span className="sh-payment-badge">{sale.paymentMethod}</span></td>
                    <td><strong>{formatCurrency(sale.total)}</strong></td>
                    <td>
                      <button type="button" className="sh-view-button" onClick={() => openReceipt(sale._id)}>
                        Receipt <ChevronRight size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="sh-empty">
            <span className="sh-empty-icon"><FileText size={28} /></span>
            <strong>No sales found</strong>
            <span>Completed POS transactions will appear here.</span>
          </div>
        )}
      </section>

      {selectedSale && <ReceiptModal sale={selectedSale} onClose={() => setSelectedSale(null)} />}
    </div>
  );
}

function Metric({ label, value, icon, tone = "sky" }) {
  return (
    <article className={`sh-metric tone-${tone}`}>
      <div className="sh-metric-head">
        <span className="sh-metric-label">{label}</span>
        <span className="sh-metric-icon">{icon}</span>
      </div>
      <strong className="sh-metric-value">{value}</strong>
    </article>
  );
}

function ReceiptModal({ sale, onClose }) {
  return (
    <div className="sh-receipt-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="sh-receipt-modal" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
        <div className="sh-receipt-toolbar">
          <span>Receipt preview</span>
          <div>
            <button type="button" onClick={() => window.print()} aria-label="Print receipt"><Printer size={17} /></button>
            <button type="button" onClick={onClose} aria-label="Close receipt"><X size={18} /></button>
          </div>
        </div>
        <div className="sh-receipt-paper" id="receipt-title">
          <div className="sh-receipt-brand">
            <strong>Stock<span>Room</span></strong>
            <small>Sales receipt</small>
          </div>
          <div className="sh-receipt-meta">
            <span>Transaction <b>#{sale._id.slice(-6).toUpperCase()}</b></span>
            <span>{new Date(sale.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
          </div>
          <div className="sh-receipt-items">
            {sale.items.map((item) => (
              <div key={item.itemId}>
                <span>{item.quantity} x {item.name}<small>{formatCurrency(item.unitPrice)} each</small></span>
                <b>{formatCurrency(item.total)}</b>
              </div>
            ))}
          </div>
          <div className="sh-receipt-totals">
            <span>Subtotal <b>{formatCurrency(sale.subtotal)}</b></span>
            <span>Discount <b>-{formatCurrency(sale.discount)}</b></span>
            <strong>Total <b>{formatCurrency(sale.total)}</b></strong>
          </div>
          <div className="sh-receipt-footer">
            <span>Payment: {sale.paymentMethod}</span>
            <small>Thank you for your business.</small>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SalesHistory;