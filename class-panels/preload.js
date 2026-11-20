const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  resizeForPanels: (count) => ipcRenderer.send('resize-for-panels', count),
});
