import csrf from "csurf";

/**
 * CSRF Protection middleware
 * Protects against Cross-Site Request Forgery attacks
 */
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
    sameSite: 'strict'
  }
});

/**
 * Send CSRF token to client
 */
export const sendCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};