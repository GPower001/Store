import mongoose from "mongoose";
import Item from "../models/Item.js";
import Sale from "../models/Sale.js";
import StockMovement from "../models/StockMovement.js";

export const scanProduct = async (req, res) => {
  try {
    const code = decodeURIComponent(String(req.params.code || "")).trim();
    if (!code) {
      return res.status(400).json({ success: false, message: "A product code is required" });
    }

    const product = await Item.findOne({
      itemCode: code,
      tenantId: req.user.tenantId,
      branchId: req.user.branchId,
      isDeleted: false,
    }).lean();

    if (!product) {
      return res.status(404).json({ success: false, message: `No product found for code ${code}` });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Scan POS product error:", error);
    res.status(500).json({ success: false, message: "Unable to scan product" });
  }
};

export const createSale = async (req, res) => {
  try {
    const { items, paymentMethod = "cash", discount = 0 } = req.body;
    const tenantId = req.user.tenantId;
    const branchId = req.user.branchId;

    if (!branchId) {
      return res.status(400).json({ success: false, message: "A branch is required to process a sale" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Add at least one product to the cart" });
    }

    if (!["cash", "card", "transfer"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Invalid payment method" });
    }

    const normalizedItems = items.map((entry) => ({
      itemId: entry.itemId,
      quantity: Number(entry.quantity),
    }));

    if (normalizedItems.some((entry) => !mongoose.isValidObjectId(entry.itemId) || !Number.isInteger(entry.quantity) || entry.quantity < 1)) {
      return res.status(400).json({ success: false, message: "Each product must have a valid quantity" });
    }

    const itemIds = normalizedItems.map((entry) => entry.itemId);
    const uniqueItemIds = [...new Set(itemIds.map(String))];
    if (uniqueItemIds.length !== itemIds.length) {
      return res.status(400).json({ success: false, message: "Duplicate products must be combined before checkout" });
    }

    const products = await Item.find({
      _id: { $in: itemIds },
      tenantId,
      branchId,
      isDeleted: false,
    });

    if (products.length !== itemIds.length) {
      return res.status(404).json({ success: false, message: "One or more products are unavailable" });
    }

    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const saleItems = [];
    let subtotal = 0;

    for (const entry of normalizedItems) {
      const product = productMap.get(String(entry.itemId));
      if (entry.quantity > product.openingQty) {
        return res.status(400).json({ success: false, message: `${product.name} only has ${product.openingQty} unit(s) available` });
      }
      const unitPrice = Number(product.price || 0);
      const total = unitPrice * entry.quantity;
      subtotal += total;
      saleItems.push({
        itemId: product._id,
        name: product.name,
        itemCode: product.itemCode,
        quantity: entry.quantity,
        unitPrice,
        total,
      });
    }

    const safeDiscount = Math.max(0, Number(discount) || 0);
    if (safeDiscount > subtotal) {
      return res.status(400).json({ success: false, message: "Discount cannot be greater than the subtotal" });
    }

    for (const entry of normalizedItems) {
      const updated = await Item.findOneAndUpdate(
        { _id: entry.itemId, tenantId, branchId, isDeleted: false, openingQty: { $gte: entry.quantity } },
        { $inc: { openingQty: -entry.quantity } },
        { new: true }
      );
      if (!updated) {
        return res.status(409).json({ success: false, message: "Stock changed while checking out. Review the cart and try again." });
      }
      const product = productMap.get(String(entry.itemId));
      await StockMovement.create({
        itemId: product._id,
        tenantId,
        branchId,
        userId: req.user.id,
        movementType: "removal",
        quantity: entry.quantity,
        previousQuantity: updated.openingQty + entry.quantity,
        newQuantity: updated.openingQty,
        reason: "Point of sale transaction",
      });
    }

    const sale = await Sale.create({
      tenantId,
      branchId,
      cashierId: req.user.id,
      items: saleItems,
      subtotal,
      discount: safeDiscount,
      total: subtotal - safeDiscount,
      paymentMethod,
    });

    res.status(201).json({ success: true, message: "Sale completed successfully", data: sale });
  } catch (error) {
    console.error("Create POS sale error:", error);
    res.status(500).json({ success: false, message: "Unable to complete sale" });
  }
};

export const getRecentSales = async (req, res) => {
  try {
    const sales = await Sale.find({ tenantId: req.user.tenantId, branchId: req.user.branchId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("cashierId", "name")
      .lean();
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load recent sales" });
  }
};

export const getSales = async (req, res) => {
  try {
    const { status, paymentMethod, startDate, endDate, page = 1, limit = 25 } = req.query;
    const filter = {
      tenantId: req.user.tenantId,
      branchId: req.user.branchId,
    };

    if (status && ["completed", "voided"].includes(status)) filter.status = status;
    if (paymentMethod && ["cash", "card", "transfer"].includes(paymentMethod)) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, Number(limit) || 25));
    const [sales, total] = await Promise.all([
      Sale.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageLimit)
        .limit(pageLimit)
        .populate("cashierId", "name")
        .lean(),
      Sale.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: sales,
      pagination: { page: pageNumber, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (error) {
    console.error("Get sales history error:", error);
    res.status(500).json({ success: false, message: "Unable to load sales history" });
  }
};

export const getSale = async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
      branchId: req.user.branchId,
    }).populate("cashierId", "name").populate("branchId", "name").lean();

    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load sale receipt" });
  }
};
