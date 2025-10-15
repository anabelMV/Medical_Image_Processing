const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  abrirDicom: (rutas) => ipcRenderer.send('abrir-dicom', rutas),
  onceAbrirDicomOk: (callback) => ipcRenderer.once('abrir-dicom-ok', callback),
  onceAbrirDicomError: (callback) => ipcRenderer.once('abrir-dicom-error', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
