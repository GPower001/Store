import PurchaseOrder from "../models/PurchaseOrder.js";
import Item from "../models/Item.js";
import Branch from "../models/branchModel.js";
import { logAudit } from "../services/auditService.js";
import { getClientIP } from "../middlewares/auditLogger.js";

/**
 * @desc Create new purchase order
 * @route POST /api/purchase-orders
 * @access Private
 */
export const createPurchaseOrder = async (req, res) => {
  try {
    const { 
      branchId, 
      supplierName, 
      supplierEmail, 
      supplierPhone, 
      supplierAddress,
      items, 
      taxRate, 
      shippingCost, 
      discount,
      expectedDeliveryDate,
      notes,
      internalNotes
    } = req.body;

    const tenantId = req.user.tenantId;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required"
      });
    }

    const branch = await Branch.findOne({ _id: branchId, tenantId, isActive: true });
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: "Branch does not belong to your organization"
      });
    }

    // Calculate totals
    let subtotal = 0;
    const itemIds = items.map((item) => item.itemId);
    const itemDocs = await Item.find({ _id: { $in: itemIds }, tenantId, isDeleted: false }).select("name").lean();
    const itemMap = new Map(itemDocs.map((item) => [String(item._id), item]));
    const processedItems = items.map((item) => {
      const itemDoc = itemMap.get(String(item.itemId));
      if (!itemDoc) throw new Error(`Item ${item.itemId} not found`);
      const totalPrice = Number(item.quantity) * Number(item.unitPrice);
      subtotal += totalPrice;
      return { itemId: item.itemId, itemName: itemDoc.name, quantity: item.quantity, unitPrice: item.unitPrice, totalPrice, notes: item.notes || '' };
    });

    const taxAmount = (subtotal * (taxRate || 0)) / 100;
    const totalAmount = subtotal + taxAmount + (shippingCost || 0) - (discount || 0);

    // Create purchase order
    const purchaseOrder = await PurchaseOrder.create({
      tenantId,
      branchId,
      supplierName,
      supplierEmail,
      supplierPhone,
      supplierAddress,
      items: processedItems,
      subtotal,
      taxRate: taxRate || 0,
      taxAmount,
      shippingCost: shippingCost || 0,
      discount: discount || 0,
      totalAmount,
      expectedDeliveryDate,
      notes,
      internalNotes,
      createdBy: req.user.id,
      status: 'draft'
    });

    // Log audit
    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      tenantId,
      branchId,
      action: 'PO_CREATED',
      resource: 'purchase_orders',
      resourceId: purchaseOrder._id,
      resourceName: purchaseOrder.poNumber,
      description: `Created purchase order ${purchaseOrder.poNumber} for ${supplierName}`,
      ipAddress: getClientIP(req),
      status: 'success',
      severity: 'medium'
    });

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      data: purchaseOrder
    });
  } catch (error) {
    console.error("Create Purchase Order Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create purchase order"
    });
  }
};

/**
 * @desc Get all purchase orders
 * @route GET /api/purchase-orders
 * @access Private
 */
export const getPurchaseOrders = async (req, res) => {
  try {
    const { status, branchId, supplier, startDate, endDate, page = 1, limit = 20 } = req.query;
    const tenantId = req.user.tenantId;

    // Build filter
    const filter = { tenantId, isDeleted: false };
    
    if (status) filter.status = status;
    if (branchId) filter.branchId = branchId;
    if (supplier) filter.supplierName = { $regex: supplier, $options: 'i' };
    
    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate);
      if (endDate) filter.orderDate.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await PurchaseOrder.countDocuments(filter);

    // Get purchase orders
    const purchaseOrders = await PurchaseOrder.find(filter)
      .populate('branchId', 'name location')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: {
        purchaseOrders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error("Get Purchase Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase orders",
      error: error.message
    });
  }
};

/**
 * @desc Get single purchase order
 * @route GET /api/purchase-orders/:id
 * @access Private
 */
export const getPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const purchaseOrder = await PurchaseOrder.findOne({
      _id: id,
      tenantId,
      isDeleted: false
    })
      .populate('branchId', 'name location')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('receivedBy', 'name email')
      .populate('items.itemId', 'name category')
      .lean();

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    }

    res.status(200).json({
      success: true,
      data: purchaseOrder
    });
  } catch (error) {
    console.error("Get Purchase Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase order",
      error: error.message
    });
  }
};

/**
 * @desc Update purchase order
 * @route PUT /api/purchase-orders/:id
 * @access Private
 */
export const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const purchaseOrder = await PurchaseOrder.findOne({
      _id: id,
      tenantId,
      isDeleted: false
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    }

    // Only allow updates for draft or pending orders
    if (!['draft', 'pending'].includes(purchaseOrder.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update purchase order with status: ${purchaseOrder.status}`
      });
    }

    const updateData = { ...req.body };
    delete updateData.poNumber; // Don't allow PO number changes
    delete updateData.tenantId; // Don't allow tenant changes

    // Recalculate totals if items changed
    if (updateData.items) {
      let subtotal = 0;
      updateData.items.forEach(item => {
        subtotal += item.quantity * item.unitPrice;
      });
      updateData.subtotal = subtotal;
      updateData.taxAmount = (subtotal * (updateData.taxRate || purchaseOrder.taxRate)) / 100;
      updateData.totalAmount = subtotal + updateData.taxAmount + 
        (updateData.shippingCost || purchaseOrder.shippingCost) - 
        (updateData.discount || purchaseOrder.discount);
    }

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      { _id: id, tenantId, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );

    // Log audit
    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      tenantId,
      branchId: updatedPO.branchId,
      action: 'PO_UPDATED',
      resource: 'purchase_orders',
      resourceId: updatedPO._id,
      resourceName: updatedPO.poNumber,
      description: `Updated purchase order ${updatedPO.poNumber}`,
      ipAddress: getClientIP(req),
      status: 'success',
      severity: 'low'
    });

    res.status(200).json({
      success: true,
      message: "Purchase order updated successfully",
      data: updatedPO
    });
  } catch (error) {
    console.error("Update Purchase Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update purchase order",
      error: error.message
    });
  }
};

/**
 * @desc Approve purchase order
 * @route PUT /api/purchase-orders/:id/approve
 * @access Private/Admin
 */
export const approvePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const purchaseOrder = await PurchaseOrder.findOne({
      _id: id,
      tenantId,
      isDeleted: false
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    }

    if (purchaseOrder.status !== 'pending' && purchaseOrder.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve purchase order with status: ${purchaseOrder.status}`
      });
    }

    purchaseOrder.status = 'approved';
    purchaseOrder.approvedBy = req.user._id;
    await purchaseOrder.save();

    // Log audit
    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      tenantId,
      branchId: purchaseOrder.branchId,
      action: 'PO_APPROVED',
      resource: 'purchase_orders',
      resourceId: purchaseOrder._id,
      resourceName: purchaseOrder.poNumber,
      description: `Approved purchase order ${purchaseOrder.poNumber}`,
      ipAddress: getClientIP(req),
      status: 'success',
      severity: 'high'
    });

    res.status(200).json({
      success: true,
      message: "Purchase order approved successfully",
      data: purchaseOrder
    });
  } catch (error) {
    console.error("Approve Purchase Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve purchase order",
      error: error.message
    });
  }
};

/**
 * @desc Receive items from purchase order
 * @route PUT /api/purchase-orders/:id/receive
 * @access Private
 */
export const receivePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { receivedItems } = req.body; // Array of { itemId, receivedQuantity }
    const tenantId = req.user.tenantId;

    const purchaseOrder = await PurchaseOrder.findOne({
      _id: id,
      tenantId,
      isDeleted: false
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    }

    if (!['approved', 'ordered', 'partially_received'].includes(purchaseOrder.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot receive items for PO with status: ${purchaseOrder.status}`
      });
    }

    // Update received quantities and inventory
    for (const received of receivedItems) {
      const poItem = purchaseOrder.items.find(
        item => item.itemId.toString() === received.itemId
      );

      if (poItem) {
        poItem.receivedQuantity = (poItem.receivedQuantity || 0) + received.receivedQuantity;

        // Update inventory
        await Item.findOneAndUpdate(
          { _id: received.itemId, tenantId, isDeleted: false },
          { $inc: { openingQty: received.receivedQuantity } }
        );
      }
    }

    // Check if all items received
    const allReceived = purchaseOrder.items.every(
      item => item.receivedQuantity >= item.quantity
    );

    const anyReceived = purchaseOrder.items.some(
      item => item.receivedQuantity > 0
    );

    if (allReceived) {
      purchaseOrder.status = 'received';
      purchaseOrder.receivedDate = new Date();
      purchaseOrder.receivedBy = req.user._id;
    } else if (anyReceived) {
      purchaseOrder.status = 'partially_received';
    }

    await purchaseOrder.save();

    // Log audit
    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      tenantId,
      branchId: purchaseOrder.branchId,
      action: 'PO_RECEIVED',
      resource: 'purchase_orders',
      resourceId: purchaseOrder._id,
      resourceName: purchaseOrder.poNumber,
      description: `Received items for PO ${purchaseOrder.poNumber}`,
      ipAddress: getClientIP(req),
      status: 'success',
      severity: 'medium',
      metadata: { receivedItems }
    });

    res.status(200).json({
      success: true,
      message: "Items received successfully",
      data: purchaseOrder
    });
  } catch (error) {
    console.error("Receive Purchase Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to receive items",
      error: error.message
    });
  }
};

/**
 * @desc Cancel purchase order
 * @route PUT /api/purchase-orders/:id/cancel
 * @access Private/Admin
 */
export const cancelPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const tenantId = req.user.tenantId;

    const purchaseOrder = await PurchaseOrder.findOne({
      _id: id,
      tenantId,
      isDeleted: false
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    }

    if (purchaseOrder.status === 'received') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a received purchase order"
      });
    }

    purchaseOrder.status = 'cancelled';
    if (reason) {
      purchaseOrder.internalNotes = `${purchaseOrder.internalNotes || ''}\nCancellation reason: ${reason}`;
    }
    await purchaseOrder.save();

    // Log audit
    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      tenantId,
      branchId: purchaseOrder.branchId,
      action: 'PO_CANCELLED',
      resource: 'purchase_orders',
      resourceId: purchaseOrder._id,
      resourceName: purchaseOrder.poNumber,
      description: `Cancelled purchase order ${purchaseOrder.poNumber}`,
      ipAddress: getClientIP(req),
      status: 'success',
      severity: 'high',
      metadata: { reason }
    });

    res.status(200).json({
      success: true,
      message: "Purchase order cancelled successfully",
      data: purchaseOrder
    });
  } catch (error) {
    console.error("Cancel Purchase Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel purchase order",
      error: error.message
    });
  }
};

/**
 * @desc Delete purchase order (soft delete)
 * @route DELETE /api/purchase-orders/:id
 * @access Private/Admin
 */
export const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const purchaseOrder = await PurchaseOrder.findOneAndUpdate(
      { _id: id, tenantId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    }

    // Log audit
    await logAudit({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      tenantId,
      branchId: purchaseOrder.branchId,
      action: 'PO_DELETED',
      resource: 'purchase_orders',
      resourceId: purchaseOrder._id,
      resourceName: purchaseOrder.poNumber,
      description: `Deleted purchase order ${purchaseOrder.poNumber}`,
      ipAddress: getClientIP(req),
      status: 'success',
      severity: 'high'
    });

    res.status(200).json({
      success: true,
      message: "Purchase order deleted successfully"
    });
  } catch (error) {
    console.error("Delete Purchase Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete purchase order",
      error: error.message
    });
  }
};

/**
 * @desc Get purchase order statistics
 * @route GET /api/purchase-orders/stats
 * @access Private
 */
export const getPurchaseOrderStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await PurchaseOrder.aggregate([
      {
        $match: {
          tenantId: tenantId,
          isDeleted: false,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          approvedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          },
          receivedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "received"] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalOrders: 0,
        totalAmount: 0,
        avgOrderValue: 0,
        pendingOrders: 0,
        approvedOrders: 0,
        receivedOrders: 0
      }
    });
  } catch (error) {
    console.error("Get PO Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase order statistics",
      error: error.message
    });
  }
};