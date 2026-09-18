import { logAudit } from "../services/auditService.js";

/**
 * Middleware to automatically log API requests
 * Use this for sensitive endpoints
 */
export const auditLogMiddleware = (action, resource) => {
  return async (req, res, next) => {
    // Save original json method
    const originalJson = res.json;

    // Override json method to capture response
    res.json = function (data) {
      // Only log if request was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log asynchronously (don't wait)
        logAudit({
          userId: req.user?._id,
          userName: req.user?.name || 'Unknown',
          userEmail: req.user?.email || 'Unknown',
          userRole: req.user?.role || 'Unknown',
          tenantId: req.user?.tenantId,
          branchId: req.user?.branchId,
          action,
          resource,
          description: `${action} - ${req.method} ${req.originalUrl}`,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          status: 'success',
          severity: 'low',
          metadata: {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode
          }
        }).catch(err => {
          console.error('Audit log error:', err);
        });
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Get client IP address
 */
export const getClientIP = (req) => {
  return (
    req.ip ||
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
};