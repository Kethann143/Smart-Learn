/**
 * app_state.js
 * Central Application Global State Store
 */

window.AppState = {
  activeView: 'home',
  currentUser: null,
  activeCourseId: null,
  theme: 'dark',
  online: navigator.onLine,
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
  },
  setState(newState) {
    Object.assign(this, newState);
    this.listeners.forEach(fn => fn(this));
  }
};
