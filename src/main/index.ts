import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { initDatabase } from '../shared/database';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

// Define isDevelopment variable
const isDevelopment = process.env.NODE_ENV !== 'production';

// Initialize database
initDatabase();

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
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
        pathname: path.join(__dirname, '../../dist/index.html'),
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

// Handle IPC messages from renderer
ipcMain.on('test-event', (event, arg) => {
  console.log('Received test event with arg:', arg);
  event.reply('test-event-reply', 'Event received in main process');
}); 