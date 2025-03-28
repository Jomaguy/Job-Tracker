const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', 
  {
    db: {
      init: async () => {
        return ipcRenderer.invoke('db-operation', { operation: 'init' });
      },
      getAll: async () => {
        return ipcRenderer.invoke('db-operation', { operation: 'getAll' });
      },
      getById: async (id) => {
        return ipcRenderer.invoke('db-operation', { operation: 'getById', data: { id } });
      },
      add: async (jobApp) => {
        console.log('Preload: Adding job application:', jobApp);
        const result = await ipcRenderer.invoke('db-operation', { operation: 'add', data: jobApp });
        console.log('Preload: Result from adding job:', result);
        return result;
      },
      update: async (jobApp) => {
        return ipcRenderer.invoke('db-operation', { operation: 'update', data: jobApp });
      },
      delete: async (id) => {
        return ipcRenderer.invoke('db-operation', { operation: 'delete', data: { id } });
      }
    }
  }
); 