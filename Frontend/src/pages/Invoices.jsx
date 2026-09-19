import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Download, FileText, Printer, RefreshCw, Search, X, XCircle } from "lucide-react";
import { exportInvoices, generateInvoice, getInvoices } from "../services/invoiceService";

const formatCurrency = (value) => `N${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
const invoiceCode = (invoice) => invoice.invoiceNumber || `INV-${String(invoice._id).slice(-6).toUpperCase()}`;

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", paymentMethod: "", startDate: "", endDate: "" });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);

  useEffect(() => {
    let active = true;
    getInvoices({ status: filters.status, paymentMethod: filters.paymentMethod, startDate: filters.startDate, endDate: filters.endDate, page: 1, limit: 100 })
      .then((response) => { if (active) setInvoices(response.data || []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Unable to load invoices"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters.status, filters.paymentMethod, filters.startDate, filters.endDate, refreshKey]);

  const updateFilter = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  const visibleInvoices = useMemo(() => invoices.filter((invoice) => `${invoiceCode(invoice)} ${invoice.customerName || "Walk-in customer"}`.toLowerCase().includes(filters.search.toLowerCase())), [filters.search, invoices]);
  const totals = useMemo(() => visibleInvoices.reduce((result, invoice) => { result.count += 1; result.total += Number(invoice.total || 0); return result; }, { count: 0, total: 0 }), [visibleInvoices]);

  const openInvoice = async (invoice) => {
    setGeneratingId(invoice._id);
    try { setSelectedInvoice(await generateInvoice(invoice._id)); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to load invoice"); }
    finally { setGeneratingId(null); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportInvoices({ status: filters.status, paymentMethod: filters.paymentMethod, startDate: filters.startDate, endDate: filters.endDate });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "stockroom-invoices.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to export invoices"); }
    finally { setExporting(false); }
  };

  return <div className="invoices-page">
    <header className="dashboard-heading invoices-heading"><div className="dashboard-heading-copy"><p className="panel-kicker">Sales documents</p><h1><FileText size={29} /> Invoices</h1><p className="dashboard-subtitle">Review completed sales as customer-ready invoices.</p></div><div className="dashboard-actions"><button className="secondary-action" onClick={() => setRefreshKey((key) => key + 1)} disabled={loading}><RefreshCw size={15} /> Refresh</button><button className="primary-action-dark" onClick={handleExport} disabled={exporting}><FileText size={15} /> {exporting ? "Exporting..." : "Export CSV"}</button></div></header>
    <section className="invoice-summary"><div><small>Invoices shown</small><strong>{totals.count}</strong></div><div><small>Total billed</small><strong>{formatCurrency(totals.total)}</strong></div><div><small>Paid</small><strong>{visibleInvoices.filter((invoice) => invoice.paymentStatus === "paid").length}</strong></div></section>
    <section className="invoice-panel"><div className="invoice-toolbar"><label className="invoice-search"><Search size={16} /><input name="search" value={filters.search} onChange={updateFilter} placeholder="Search invoice or customer" /></label><div className="invoice-filters"><label><span>Status</span><select name="status" value={filters.status} onChange={updateFilter}><option value="">All</option><option value="paid">Paid</option><option value="voided">Voided</option></select></label><label><span>Payment</span><select name="paymentMethod" value={filters.paymentMethod} onChange={updateFilter}><option value="">All methods</option><option value="cash">Cash</option><option value="card">Card</option><option value="transfer">Transfer</option></select></label><label><span>From</span><input name="startDate" type="date" value={filters.startDate} onChange={updateFilter} /></label><label><span>To</span><input name="endDate" type="date" value={filters.endDate} onChange={updateFilter} /></label></div></div>{error && <div className="invoice-error" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss error"><X size={14} /></button></div>}{loading ? <div className="invoice-empty">Loading invoices...</div> : visibleInvoices.length ? <div className="invoice-table-wrap"><table className="invoice-table"><thead><tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Payment</th><th>Status</th><th>Total</th><th /></tr></thead><tbody>{visibleInvoices.map((invoice) => <tr key={invoice._id}><td><strong>{invoiceCode(invoice)}</strong><small>{invoice.items?.length || 0} line items</small></td><td>{invoice.customerName || "Walk-in customer"}</td><td>{new Date(invoice.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</td><td><span className="invoice-payment">{invoice.paymentMethod}</span></td><td><span className={`invoice-status ${invoice.paymentStatus}`}>{invoice.paymentStatus === "paid" ? <CheckCircle2 size={13} /> : <XCircle size={13} />}{invoice.paymentStatus}</span></td><td><strong>{formatCurrency(invoice.total)}</strong></td><td><button className="invoice-view-button" onClick={() => openInvoice(invoice)} disabled={generatingId === invoice._id}>{generatingId === invoice._id ? "Generating..." : "Generate"} <ChevronRight size={14} /></button></td></tr>)}</tbody></table></div> : <div className="invoice-empty"><FileText size={29} /><strong>No invoices found</strong><span>Completed POS sales will appear here.</span></div>}</section>
    {selectedInvoice && <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
  </div>;
}

function InvoiceModal({ invoice, onClose }) {
  const downloadInvoice = () => {
    const rows = invoice.items.map((item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${formatCurrency(item.unitPrice)}</td><td>${formatCurrency(item.total)}</td></tr>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${invoiceCode(invoice)}</title><style>body{font:14px Arial;color:#173b68;max-width:760px;margin:40px auto}header{display:flex;justify-content:space-between;border-bottom:2px solid #073b7a;padding-bottom:18px}h1{font-size:22px}table{width:100%;border-collapse:collapse;margin-top:30px}td,th{text-align:left;padding:12px 6px;border-bottom:1px solid #d8e5f7}footer{margin-top:28px;border-top:1px solid #d8e5f7;padding-top:14px}</style></head><body><header><div><h1>StockRoom</h1><div>Customer invoice</div></div><strong>${invoiceCode(invoice)}</strong></header><p>Customer: ${invoice.customerName || "Walk-in customer"}<br>Issued: ${new Date(invoice.createdAt).toLocaleString("en-NG")}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><p style="text-align:right"><strong>Subtotal: ${formatCurrency(invoice.subtotal)}<br>Discount: ${formatCurrency(invoice.discount)}<br>Total: ${formatCurrency(invoice.total)}</strong></p><footer>${invoice.paymentStatus === "paid" ? "Paid in full" : "Invoice voided"}</footer></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoiceCode(invoice)}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return <div className="invoice-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="invoice-modal" role="dialog" aria-modal="true" aria-labelledby="invoice-title"><div className="invoice-modal-toolbar"><span>Invoice preview</span><div><button onClick={downloadInvoice} aria-label="Download invoice"><Download size={16} /></button><button onClick={() => window.print()} aria-label="Print invoice"><Printer size={16} /></button><button onClick={onClose} aria-label="Close invoice"><X size={17} /></button></div></div><div className="invoice-paper" id="invoice-title"><div className="invoice-paper-heading"><div><strong>Stock<span>Room</span></strong><small>Customer invoice</small></div><b>{invoiceCode(invoice)}</b></div><div className="invoice-paper-meta"><span><small>Issued</small>{new Date(invoice.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span><span><small>Customer</small>{invoice.customerName || "Walk-in customer"}</span><span><small>Payment</small>{invoice.paymentMethod}</span></div><div className="invoice-paper-items">{invoice.items.map((item) => <div key={`${item.itemId}-${item.name}`}><span>{item.name}<small>{item.quantity} x {formatCurrency(item.unitPrice)}</small></span><b>{formatCurrency(item.total)}</b></div>)}</div><div className="invoice-paper-totals"><span>Subtotal <b>{formatCurrency(invoice.subtotal)}</b></span><span>Discount <b>-{formatCurrency(invoice.discount)}</b></span><strong>Total <b>{formatCurrency(invoice.total)}</b></strong></div><div className="invoice-paper-footer"><span>{invoice.paymentStatus === "paid" ? "Paid in full" : "Invoice voided"}</span><small>Thank you for your business.</small></div></div></section></div>;
}

export default Invoices;
