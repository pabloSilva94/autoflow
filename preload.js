const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getFlows: () => ipcRenderer.invoke('flows:get'),
  saveFlows: (flows) => ipcRenderer.invoke('flows:save', flows),
  getFolders: () => ipcRenderer.invoke('folders:get'),
  saveFolders: (folders) => ipcRenderer.invoke('folders:save', folders),
  runFlow: (id) => ipcRenderer.invoke('flow:run', id),
  getAutostart: () => ipcRenderer.invoke('auto:get'),
  setAutostart: (v) => ipcRenderer.invoke('auto:set', v),
  recStart: (opts) => ipcRenderer.invoke('rec:start', opts),
  recStop: () => ipcRenderer.invoke('rec:stop'),
  exportFlow: (flow) => ipcRenderer.invoke('flow:export', flow),
  importFlow: () => ipcRenderer.invoke('flow:import'),
  onRecDone: (cb) => ipcRenderer.on('rec:done', (_, s) => cb(s)),
  onLog: (cb) => ipcRenderer.on('log', (_, m) => cb(m))
});