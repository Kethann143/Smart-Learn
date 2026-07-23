/**
 * app_shared.js
 * Shared Utilities & Helpers for Component Interoperability
 */

window.AppShared = {
  formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  },
  sanitizeKey(email) {
    if (!email) return 'anonymous';
    return email.toLowerCase().replace(/\./g, '_').replace(/@/g, '_at_');
  }
};
