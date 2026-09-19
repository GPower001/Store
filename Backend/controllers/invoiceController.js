import Sale from "../models/Sale.js";

const invoiceNumber = (sale) => `INV-${new Date(sale.createdAt).getFullYear()}-${String(sale._id).slice(-6).toUpperCase()}`;
const toInvoice = (sale) => ({
  ...sale,
  invoiceNumber: invoiceNumber(sale),
  customerName: sale.customerName || "Walk-in customer",
  paymentStatus: sale.status === "voided" ? "voided" : "paid",
});

const buildFilter = (req) => {
  const { status, paymentMethod, startDate, endDate } = req.query;
  const filter = { tenantId: req.user.tenantId, branchId: req.user.branchId };
  if (status === "paid") filter.status = "completed";
  if (status === "voided") filter.status = "voided";
  if (["cash", "card", "transfer"].includes(paymentMethod)) filter.paymentMethod = paymentMethod;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }
  return filter;
};

export const getInvoices = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const filter = buildFilter(req);
    const [sales, total] = await Promise.all([
      Sale.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("cashierId", "name").populate("branchId", "name").lean(),
      Sale.countDocuments(filter),
    ]);
    res.json({ success: true, data: sales.map(toInvoice), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Get invoices error:", error);
    res.status(500).json({ success: false, message: "Unable to load invoices" });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const sale = await Sale.findOne({ _id: req.params.id, tenantId: req.user.tenantId, branchId: req.user.branchId })
      .populate("cashierId", "name")
      .populate("branchId", "name location")
      .lean();
    if (!sale) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, data: toInvoice(sale) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load invoice" });
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const sale = await Sale.findOne({ _id: req.params.id, tenantId: req.user.tenantId, branchId: req.user.branchId })
      .populate("cashierId", "name")
      .populate("branchId", "name location")
      .lean();
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
    res.status(201).json({ success: true, message: "Invoice generated successfully", data: toInvoice(sale) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to generate invoice" });
  }
};

export const exportInvoices = async (req, res) => {
  try {
    const sales = await Sale.find(buildFilter(req)).sort({ createdAt: -1 }).lean();
    const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const headers = ["Invoice", "Customer", "Date", "Payment method", "Status", "Subtotal", "Discount", "Total"];
    const rows = sales.map((sale) => [
      invoiceNumber(sale),
      sale.customerName || "Walk-in customer",
      new Date(sale.createdAt).toISOString(),
      sale.paymentMethod,
      sale.status === "voided" ? "voided" : "paid",
      Number(sale.subtotal || 0).toFixed(2),
      Number(sale.discount || 0).toFixed(2),
      Number(sale.total || 0).toFixed(2),
    ].map(escapeCsv).join(","));
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=stockroom-invoices.csv");
    res.send([headers.join(","), ...rows].join("\n"));
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to export invoices" });
  }
};
