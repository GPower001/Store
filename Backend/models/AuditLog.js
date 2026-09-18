import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    // Who performed the action
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    userRole: {
      type: String,
      required: true
    },
    
    // Which organization
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true
    },
    
    // Which branch (optional - some actions aren't branch-specific)
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch"
    },
    branchName: {
      type: String
    },
    
    // What action was performed
    action: {
      type: String,
      required: true,
      enum: [
        // User actions
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_CREATED',
        'USER_UPDATED',
        'USER_DELETED',
        'USER_ROLE_CHANGED',
        'PASSWORD_CHANGED',
        
        // Item actions
        'ITEM_CREATED',
        'ITEM_UPDATED',
        'ITEM_DELETED',
        'ITEM_STOCK_ADDED',
        'ITEM_STOCK_REMOVED',
        'ITEM_STOCK_ADJUSTED',
        
        // Branch actions
        'BRANCH_CREATED',
        'BRANCH_UPDATED',
        'BRANCH_DELETED',
        
        // Stock transfer
        'STOCK_TRANSFERRED',
        // Purchase order
        'PO_CREATED',
        'PO_UPDATED',
        'PO_APPROVED',
        'PO_RECEIVED',
        'PO_CANCELLED',
        'PO_DELETED',
        
        // Subscription actions
        'SUBSCRIPTION_UPGRADED',
        'SUBSCRIPTION_CANCELLED',
        'STAFF_SLOTS_ADDED',
        'STAFF_SLOTS_REMOVED',
        
        // Security events
        'FAILED_LOGIN_ATTEMPT',
        'SUSPICIOUS_ACTIVITY',
        'RATE_LIMIT_EXCEEDED',
        
        // Data export
        'DATA_EXPORTED',
        'REPORT_GENERATED',
        
        // Settings
        'SETTINGS_CHANGED'
      ]
    },
    
    // Which resource was affected
    resource: {
      type: String,
      required: true,
      enum: ['users', 'items', 'branches', 'stock', 'subscription', 'security', 'reports', 'settings', 'purchase_orders']
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId
    },
    resourceName: {
      type: String
    },
    
    // What changed
    changes: {
      before: mongoose.Schema.Types.Mixed,  // State before change
      after: mongoose.Schema.Types.Mixed    // State after change
    },
    
    // Additional details
    description: {
      type: String,
      required: true
    },
    
    // Request metadata
    ipAddress: {
      type: String,
      required: true
    },
    userAgent: {
      type: String
    },
    
    // Status
    status: {
      type: String,
      enum: ['success', 'failure', 'warning'],
      default: 'success'
    },
    
    // Severity level
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { 
    timestamps: true,
    // Create indexes for faster queries
    indexes: [
      { tenantId: 1, createdAt: -1 },
      { userId: 1, createdAt: -1 },
      { action: 1, createdAt: -1 },
      { resource: 1, createdAt: -1 }
    ]
  }
);

// Indexes for better query performance
auditLogSchema.index({ tenantId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ ipAddress: 1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
