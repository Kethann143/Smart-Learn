/**
 * electron-preload.js
 * Preload script — exposes safe IPC bridge to the renderer (web page).
 * All APIs exposed here are accessible as window.electronAPI in the browser.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize:    () => ipcRenderer.send('window-minimize'),
  maximize:    () => ipcRenderer.send('window-maximize'),
  close:       () => ipcRenderer.send('window-close'),
  quit:        () => ipcRenderer.send('window-quit'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // Environment flag so the app knows it's running inside Electron
  isElectron: true,
  platform: process.platform,
});
