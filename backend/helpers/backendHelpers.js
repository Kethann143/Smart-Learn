/**
 * backendHelpers.js
 * Express Server Route & Utility Helper Functions
 */

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = {
  sanitizeUser,
  validateEmail
};
