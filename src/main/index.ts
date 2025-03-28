/**
 * Main process file for the Electron application.
 * This file handles the creation and management of the main application window
 * and sets up IPC (Inter-Process Communication) between main and renderer processes.
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { initDatabase } from '../shared/database';

// Global reference to the main window to prevent garbage collection
// This is necessary because JavaScript's garbage collector might clean up the window
// if there are no references to it
let mainWindow: BrowserWindow | null = null;

// Determine if the application is running in development mode
// This affects various behaviors like DevTools availability and security settings
const isDevelopment = process.env.NODE_ENV !== 'production';

// Initialize the application's database connection
// This should be done before any database operations are attempted
initDatabase();

/**
 * Creates the main application window with appropriate settings and configurations.
 * This function is responsible for:
 * 1. Creating the browser window with specific dimensions and constraints
 * 2. Setting up web preferences for security and development features
 * 3. Loading the appropriate URL based on the environment (dev/prod)
 * 4. Setting up window cleanup on close
 */
function createWindow() {
  // Create the browser window with specific dimensions and constraints
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,    // Minimum window width to ensure proper layout
    minHeight: 600,   // Minimum window height to ensure proper layout
    webPreferences: {
      nodeIntegration: true,      // Enable Node.js integration in renderer process
      contextIsolation: false,    // Disable context isolation for direct Node.js access
      webSecurity: !isDevelopment, // Disable web security only in development
    },
  });

  // Load the application content based on the environment
  if (isDevelopment) {
    // In development mode, load from the development server
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools for debugging
    mainWindow.webContents.openDevTools();
  } else {
    // In production mode, load the built index.html file
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../../dist/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  // Clean up the window reference when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize the application when Electron is ready
// This is the main entry point for the application
app.on('ready', createWindow);

/**
 * Handle application lifecycle events
 * This section manages how the application behaves when all windows are closed
 * and when the application is activated (e.g., clicking the dock icon on macOS)
 */

// Quit the application when all windows are closed
// On macOS, applications typically stay open until explicitly quit
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Recreate the window when the dock icon is clicked on macOS
// This is standard behavior for macOS applications
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * IPC (Inter-Process Communication) handlers
 * These handlers manage communication between the main process and renderer process
 */

// Example IPC handler for test events
// Demonstrates basic IPC communication between main and renderer processes
ipcMain.on('test-event', (event, arg) => {
  console.log('Received test event with arg:', arg);
  // Reply to the renderer process
  event.reply('test-event-reply', 'Event received in main process');
}); 