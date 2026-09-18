import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

/**
 * Sanitize MongoDB queries to prevent NoSQL injection
 */
export const sanitizeMongo = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️  Sanitized request on key: ${key}`);
  }
});

/**
 * Clean user input to prevent XSS attacks
 */
export const sanitizeXSS = xss();

/**
 * Custom sanitizer for specific fields
 */
export const sanitizeInput = (req, res, next) => {
  // Sanitize string fields in body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove any script tags
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Remove any HTML event handlers
        req.body[key] = req.body[key].replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        
        // Trim whitespace
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  next();
};