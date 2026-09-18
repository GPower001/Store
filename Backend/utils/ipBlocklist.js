// In-memory blocklist (in production, use Redis or database)
const blockedIPs = new Set();

/**
 * Add IP to blocklist
 */
export const blockIP = (ip) => {
  blockedIPs.add(ip);
  console.log(`🚫 Blocked IP: ${ip}`);
};

/**
 * Remove IP from blocklist
 */
export const unblockIP = (ip) => {
  blockedIPs.delete(ip);
  console.log(`✅ Unblocked IP: ${ip}`);
};

/**
 * Check if IP is blocked
 */
export const checkIPBlocklist = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  if (blockedIPs.has(ip)) {
    console.warn(`⚠️  Blocked request from IP: ${ip}`);
    return res.status(403).json({
      success: false,
      message: "Access denied. Your IP has been blocked."
    });
  }
  
  next();
};

/**
 * Auto-block IP after too many failed attempts
 */
const failedAttempts = new Map();

export const trackFailedAttempts = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  // Only track failed login attempts
  if (req.path.includes('/login') && res.statusCode === 401) {
    const attempts = failedAttempts.get(ip) || 0;
    failedAttempts.set(ip, attempts + 1);
    
    // Block after 10 failed attempts
    if (attempts + 1 >= 10) {
      blockIP(ip);
      failedAttempts.delete(ip);
    }
    
    // Clear attempts after 1 hour
    setTimeout(() => {
      failedAttempts.delete(ip);
    }, 60 * 60 * 1000);
  }
  
  next();
};