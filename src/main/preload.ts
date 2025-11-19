import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
  processAudio: (inputPath: string, outputPath: string, options: any) =>
    ipcRenderer.invoke('process-audio', inputPath, outputPath, options),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('show-notification', title, body),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openFileLocation: (filePath: string) => ipcRenderer.invoke('open-file-location', filePath),

  // Event listeners
  onProcessingProgress: (callback: (progress: number) => void) => {
    ipcRenderer.on('processing-progress', (event, progress) => callback(progress));
  },
  onUpdateAvailable: (callback: (info: any) => void) => {
    ipcRenderer.on('update-available', (event, info) => callback(info));
  },
  onDownloadProgress: (callback: (percent: number) => void) => {
    ipcRenderer.on('download-progress', (event, percent) => callback(percent));
  },
  onUpdateDownloaded: (callback: (info: any) => void) => {
    ipcRenderer.on('update-downloaded', (event, info) => callback(info));
  }
});

// Type declaration for TypeScript
declare global {
  interface Window {
    electronAPI: {
      selectFile: () => Promise<string | null>;
      selectOutputDir: () => Promise<string | null>;
      processAudio: (inputPath: string, outputPath: string, options: any) => Promise<{ success: boolean; error?: string }>;
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<boolean>;
      showNotification: (title: string, body: string) => Promise<void>;
      getAppVersion: () => Promise<string>;
      openFileLocation: (filePath: string) => Promise<void>;
      onProcessingProgress: (callback: (progress: number) => void) => void;
      onUpdateAvailable: (callback: (info: any) => void) => void;
      onDownloadProgress: (callback: (percent: number) => void) => void;
      onUpdateDownloaded: (callback: (info: any) => void) => void;
    };
  }
}
