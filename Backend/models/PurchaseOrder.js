import mongoose from "mongoose";

const purchaseOrderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true
  },
  receivedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: String
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    // Organization
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true
    },
    
    // Branch
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },
    
    // PO Number (auto-generated)
    poNumber: {
      type: String,
      required: true,
      unique: true
    },
    
    // Supplier Information
    supplierName: {
      type: String,
      required: true
    },
    supplierEmail: {
      type: String
    },
    supplierPhone: {
      type: String
    },
    supplierAddress: {
      type: String
    },
    
    // Items
    items: [purchaseOrderItemSchema],
    
    // Financial
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'ordered', 'partially_received', 'received', 'cancelled'],
      default: 'draft'
    },
    
    // Dates
    orderDate: {
      type: Date,
      default: Date.now
    },
    expectedDeliveryDate: {
      type: Date
    },
    receivedDate: {
      type: Date
    },
    
    // User tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    
    // Notes
    notes: {
      type: String
    },
    internalNotes: {
      type: String
    },
    
    // Payment
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'credit_card', 'check', 'other']
    },
    
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    indexes: [
      { tenantId: 1, poNumber: 1 },
      { tenantId: 1, status: 1 },
      { tenantId: 1, createdAt: -1 }
    ]
  }
);

// Generate PO Number
purchaseOrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.poNumber) {
    const count = await mongoose.model('PurchaseOrder').countDocuments({ tenantId: this.tenantId });
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.poNumber = `PO${year}${month}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes
purchaseOrderSchema.index({ tenantId: 1, poNumber: 1 });
purchaseOrderSchema.index({ tenantId: 1, status: 1 });
purchaseOrderSchema.index({ tenantId: 1, createdAt: -1 });
purchaseOrderSchema.index({ supplierName: 1 });

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);