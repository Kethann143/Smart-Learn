/**
 * app_providers.js
 * Application Dependency & System Provider Register
 */

window.AppProviders = {
  db: () => window.SmartLearningDB,
  auth: () => window.AuthSystem,
  ai: () => window.AITutorSystem,
  federated: () => window.FederatedSystem
};
