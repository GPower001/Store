import AuditLog from "../models/AuditLog.js";

/**
 * Main function to log audit events
 */
export const logAudit = async ({
  userId,
  userName,
  userEmail,
  userRole,
  tenantId,
  branchId = null,
  branchName = null,
  action,
  resource,
  resourceId = null,
  resourceName = null,
  changes = {},
  description,
  ipAddress,
  userAgent = null,
  status = 'success',
  severity = 'medium',
  metadata = {}
}) => {
  try {
    const auditLog = await AuditLog.create({
      userId,
      userName,
      userEmail,
      userRole,
      tenantId,
      branchId,
      branchName,
      action,
      resource,
      resourceId,
      resourceName,
      changes,
      description,
      ipAddress,
      userAgent,
      status,
      severity,
      metadata
    });

    console.log(`📝 Audit Log: ${action} by ${userName} (${userEmail})`);
    return auditLog;
  } catch (error) {
    console.error("❌ Failed to create audit log:", error);
    // Don't throw - audit logging shouldn't break main functionality
    return null;
  }
};

/**
 * Log user login
 */
export const logLogin = async (user, ipAddress, userAgent, status = 'success') => {
  return logAudit({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    tenantId: user.tenantId,
    branchId: user.branchId,
    action: status === 'success' ? 'USER_LOGIN' : 'FAILED_LOGIN_ATTEMPT',
    resource: 'security',
    description: status === 'success' 
      ? `User ${user.name} logged in successfully`
      : `Failed login attempt for ${user.email}`,
    ipAddress,
    userAgent,
    status,
    severity: status === 'success' ? 'low' : 'medium'
  });
};

/**
 * Log user logout
 */
export const logLogout = async (user, ipAddress, userAgent) => {
  return logAudit({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    tenantId: user.tenantId,
    branchId: user.branchId,
    action: 'USER_LOGOUT',
    resource: 'security',
    description: `User ${user.name} logged out`,
    ipAddress,
    userAgent,
    status: 'success',
    severity: 'low'
  });
};

/**
 * Log item creation
 */
export const logItemCreated = async (user, item, ipAddress) => {
  return logAudit({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    tenantId: user.tenantId,
    branchId: item.branchId,
    action: 'ITEM_CREATED',
    resource: 'items',
    resourceId: item._id,
    resourceName: item.name,
    changes: {
      after: {
        name: item.name,
        category: item.category,
        quantity: item.openingQty,
        price: item.price
      }
    },
    description: `Created item "${item.name}" with ${item.openingQty} units`,
    ipAddress,
    status: 'success',
    severity: 'low'
  });
};

/**
 * Log item update
 */
export const logItemUpdated = async (user, itemBefore, itemAfter, ipAddress) => {
  return logAudit({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    tenantId: user.tenantId,
    branchId: itemAfter.branchId,
    action: 'ITEM_UPDATED',
    resource: 'items',
    resourceId: itemAfter._id,
    resourceName: itemAfter.name,
    changes: {
      before: {
        name: itemBefore.name,
        quantity: itemBefore.openingQty,
        price: itemBefore.price,
        minStock: itemBefore.minStock
      },
      after: {
        name: itemAfter.name,
        quantity: itemAfter.openingQty,
        price: itemAfter.price,
        minStock: itemAfter.minStock
      }
    },
    description: `Updated item "${itemAfter.name}"`,
    ipAddress,
    status: 'success',
    severity: 'low'
  });
};

/**
 * Log item deletion
 */
export const logItemDeleted = async (user, item, ipAddress) => {
  return logAudit({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    tenantId: user.tenantId,
    branchId: item.branchId,
    action: 'ITEM_DELETED',
    resource: 'items',
    resourceId: item._id,
    resourceName: item.name,
    changes: {
      before: {
        name: item.name,
        quantity: item.openingQty,
        category: item.category
      }
    },
    description: `Deleted item "${item.name}" (had ${item.openingQty} units)`,
    ipAddress,
    status: 'success',
    severity: 'medium'
  });
};

/**
 * Log user creation
 */
export const logUserCreated = async (creator, newUser, ipAddress) => {
  return logAudit({
    userId: creator._id,
    userName: creator.name,
    userEmail: creator.email,
    userRole: creator.role,
    tenantId: creator.tenantId,
    action: 'USER_CREATED',
    resource: 'users',
    resourceId: newUser._id,
    resourceName: newUser.name,
    changes: {
      after: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    },
    description: `Created new user "${newUser.name}" with role ${newUser.role}`,
    ipAddress,
    status: 'success',
    severity: 'medium'
  });
};

/**
 * Log user deletion
 */
export const logUserDeleted = async (deletor, deletedUser, ipAddress) => {
  return logAudit({
    userId: deletor._id,
    userName: deletor.name,
    userEmail: deletor.email,
    userRole: deletor.role,
    tenantId: deletor.tenantId,
    action: 'USER_DELETED',
    resource: 'users',
    resourceId: deletedUser._id,
    resourceName: deletedUser.name,
    changes: {
      before: {
        name: deletedUser.name,
        email: deletedUser.email,
        role: deletedUser.role
      }
    },
    description: `Deleted user "${deletedUser.name}" (${deletedUser.email})`,
    ipAddress,
    status: 'success',
    severity: 'high'
  });
};

/**
 * Log branch creation
 */
export const logBranchCreated = async (user, branch, ipAddress) => {
  return logAudit({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    tenantId: user.tenantId,
    action: 'BRANCH_CREATED',
    resource: 'branches',
    resourceId: branch._id,
    resourceName: branch.name,
    changes: {
      after: {
        name: branch.name,
        location: branch.location
      }
    },
    description: `Created branch "${branch.name}" at ${branch.location}`,
    ipAddress,
    status: 'success',
    severity: 'medium'
  });
};

/**
 * Log branch deletion
 */
export const logBranchDeleted = async (user, branch, ipAddress) => {
  return logAudit({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    tenantId: user.tenantId,
    action: 'BRANCH_DELETED',
    resource: 'branches',
    resourceId: branch._id,
    resourceName: branch.name,
    changes: {
      before: {
        name: branch.name,
        location: branch.location
      }
    },
    description: `Deleted branch "${branch.name}"`,
    ipAddress,
    status: 'success',
    severity: 'high'
  });
};

/**
 * Log subscription upgrade
 */
export const logSubscriptionUpgrade = async (user, fromTier, toTier, ipAddress) => {
  return logAudit({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    tenantId: user.tenantId,
    action: 'SUBSCRIPTION_UPGRADED',
    resource: 'subscription',
    changes: {
      before: { tier: fromTier },
      after: { tier: toTier }
    },
    description: `Upgraded subscription from ${fromTier} to ${toTier}`,
    ipAddress,
    status: 'success',
    severity: 'medium'
  });
};

/**
 * Log data export
 */
export const logDataExport = async (user, exportType, ipAddress) => {
  return logAudit({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    tenantId: user.tenantId,
    action: 'DATA_EXPORTED',
    resource: 'reports',
    description: `Exported ${exportType} data`,
    ipAddress,
    status: 'success',
    severity: 'low',
    metadata: { exportType }
  });
};