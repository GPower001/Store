import helmet from "helmet";

/**
 * Security headers middleware using Helmet
 * Protects against common web vulnerabilities
 */
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  
  // Prevent clickjacking
  frameguard: {
    action: 'deny'
  },
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Enable XSS filter
  xssFilter: true,
  
  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
});

/**
 * Custom security headers
 */
export const customSecurityHeaders = (req, res, next) => {
  // Prevent caching of sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Remove fingerprinting headers
  res.removeHeader('X-Powered-By');
  
  next();
};

// ============================================================
// FILE 3: Backend/middlewares/validator.js (NEW FILE - CREATE THIS)
// ============================================================

import { body, param, query, validationResult } from "express-validator";

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * Validation rules for user registration
 */
export const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email is too long'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['Admin', 'Manager', 'Nurse', 'Staff']).withMessage('Invalid role'),
  
  handleValidationErrors
];

/**
 * Validation rules for login
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Validation rules for tenant registration
 */
export const validateTenantRegistration = [
  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Company name must be between 2 and 200 characters'),

  body('industry')
    .trim()
    .notEmpty().withMessage('Industry is required')
    .isIn([
      'Retail/General trade',
      'Supermarket / Grocery',
      'Fashion and Apparel',
      'Food and Beverage',
      'Restaurant and Hospitality',
      'Health and beauty / cosmetics',
      'Pharmacy',
      'Electronics and Gadgets',
      'Building and Hardware',
      'Automotive and Spare-parts',
      'Furniture and Home',
      'Agriculture and Agro-Processing',
      'Manufacturing',
      'Wholesale / distribution',
      'Services',
      'Other'
    ]).withMessage('Invalid industry'),

  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('referralCode').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('Referral code is too long'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),

  body('confirmPassword')
    .notEmpty().withMessage('Password confirmation is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  
  body('ownerName')
    .trim()
    .notEmpty().withMessage('Owner name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Owner name must be between 2 and 100 characters'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
  
  handleValidationErrors
];

/**
 * Validation rules for adding items
 */
export const validateAddItem = [
  body('name')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Item name must be between 2 and 200 characters'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['General', 'Consumables', 'Medications']).withMessage('Invalid category'),
  
  body('openingQty')
    .notEmpty().withMessage('Opening quantity is required')
    .isInt({ min: 0 }).withMessage('Opening quantity must be a positive number')
    .toInt(),
  
  body('minStock')
    .notEmpty().withMessage('Minimum stock is required')
    .isInt({ min: 0 }).withMessage('Minimum stock must be a positive number')
    .toInt(),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number')
    .toFloat(),
  
  body('expiryDate')
    .optional()
    .isISO8601().withMessage('Invalid expiry date format')
    .toDate(),
  
  handleValidationErrors
];

/**
 * Validation rules for updating items
 */
export const validateUpdateItem = [
  body('additionalStock')
    .optional()
    .isInt().withMessage('Additional stock must be a number')
    .toInt(),
  
  body('minStock')
    .optional()
    .isInt({ min: 0 }).withMessage('Minimum stock must be a positive number')
    .toInt(),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number')
    .toFloat(),
  
  handleValidationErrors
];

/**
 * Validation rules for MongoDB ObjectId parameters
 */
export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .matches(/^[0-9a-fA-F]{24}$/).withMessage('Invalid ID format'),
  
  handleValidationErrors
];

/**
 * Validation rules for pagination
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive number')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  handleValidationErrors
];