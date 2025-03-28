const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

// Initialize database
const { initDatabase } = require('../src/shared/database.js');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow = null;

// Define isDevelopment variable
const isDevelopment = process.env.NODE_ENV !== 'production';

// Initialize database
try {
  console.log('Initializing database...');
  initDatabase();
  console.log('Database initialization successful');
} catch (error) {
  console.error('Failed to initialize database:', error);
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDevelopment,
    },
  });

  // Load the app
  if (isDevelopment) {
    // Load from dev server in development mode
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools
    mainWindow.webContents.openDevTools();
  } else {
    // Load the index.html of the app in production mode
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay open until the user quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it is common to re-create a window when dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle IPC messages for database operations
ipcMain.handle('db-operation', async (event, { operation, data }) => {
  console.log(`IPC: Received ${operation} operation with data:`, data);
  try {
    const { initDatabase, getJobApplications, getJobApplicationById, addJobApplication, updateJobApplication, deleteJobApplication } = require('../src/shared/database.js');
    
    switch (operation) {
      case 'init':
        await initDatabase();
        return { success: true };
      
      case 'getAll':
        return getJobApplications();
      
      case 'getById':
        return getJobApplicationById(data.id);
      
      case 'add':
        console.log('IPC: Adding job application:', data);
        const id = addJobApplication(data);
        console.log('IPC: Job added with ID:', id);
        return getJobApplicationById(id);
      
      case 'update':
        const updated = updateJobApplication(data);
        return updated ? getJobApplicationById(data.id) : null;
      
      case 'delete':
        return deleteJobApplication(data.id);
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    console.error(`IPC: Error in ${operation} operation:`, error);
    // Converting the error to a plain object for IPC transmission
    return { error: true, message: error.message, stack: error.stack };
  }
}); 