const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // Method to send data from the renderer to the main process
    fromBrowser: (data: any) => ipcRenderer.send('data-from-browser', data),

    // Method to listen for messages sent from the main process to the renderer
    fromMain: (callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on('data-from-main', callback)
});
