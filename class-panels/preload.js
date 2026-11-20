const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  resizeForPanels: (count) => ipcRenderer.send('resize-for-panels', count),
  // Automatic backups: main.js saves the file in Documents/ClassPanels Backups
  writeBackup: (name, json) => ipcRenderer.invoke('write-backup', name, json),
});
