import { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage, Notification } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';
import { AudioProcessor } from './audioProcessor';

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
autoUpdater.logger = log;

// Initialize store for settings
const store = new Store({
  defaults: {
    windowBounds: { width: 1000, height: 700 },
    noiseReduction: {
      level: 'medium',
      preserveVoice: true
    },
    lastOutputDir: app.getPath('downloads')
  }
});

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let audioProcessor: AudioProcessor;

function createWindow(): void {
  const bounds = store.get('windowBounds') as { width: number; height: number };

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#f3f3f3',
    show: false,
    frame: true,
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    },
    icon: path.join(__dirname, '../../build/icon.png')
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    log.info('Application window shown');
  });

  // Save window bounds on resize/move
  mainWindow.on('resize', () => {
    if (mainWindow) {
      store.set('windowBounds', mainWindow.getBounds());
    }
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();

      if (Notification.isSupported()) {
        new Notification({
          title: 'AI Audio Noise Reducer',
          body: 'App is still running in the background'
        }).show();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray(): void {
  const iconPath = path.join(__dirname, '../../build/icon.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      }
    },
    {
      label: 'Check for Updates',
      click: () => {
        autoUpdater.checkForUpdatesAndNotify();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('AI Audio Noise Reducer');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    } else {
      createWindow();
    }
  });
}

// IPC Handlers
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('select-output-dir', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    defaultPath: store.get('lastOutputDir') as string
  });

  if (!result.canceled && result.filePaths.length > 0) {
    store.set('lastOutputDir', result.filePaths[0]);
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('process-audio', async (event, inputPath: string, outputPath: string, options: any) => {
  try {
    log.info(`Processing audio: ${inputPath} -> ${outputPath}`);

    // Send progress updates
    const onProgress = (progress: number) => {
      event.sender.send('processing-progress', progress);
    };

    await audioProcessor.processAudio(inputPath, outputPath, options, onProgress);

    log.info('Audio processing completed successfully');
    return { success: true };
  } catch (error) {
    log.error('Audio processing failed:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('get-settings', () => {
  return store.store;
});

ipcMain.handle('save-settings', (event, settings) => {
  Object.keys(settings).forEach(key => {
    store.set(key, settings[key]);
  });
  return true;
});

ipcMain.handle('show-notification', (event, title: string, body: string) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('open-file-location', (event, filePath: string) => {
  const { shell } = require('electron');
  shell.showItemInFolder(filePath);
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
  mainWindow?.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info);
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  log.info('Download progress:', progressObj.percent);
  mainWindow?.webContents.send('download-progress', progressObj.percent);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  mainWindow?.webContents.send('update-downloaded', info);
});

// App lifecycle
app.whenReady().then(() => {
  log.info('App is ready');

  // Initialize audio processor
  audioProcessor = new AudioProcessor();

  createWindow();
  createTray();

  // Check for updates on startup (only in production)
  if (process.env.NODE_ENV !== 'development') {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 3000);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Keep app running in background on Windows
  // Don't quit
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

// Handle errors
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection:', reason);
});
