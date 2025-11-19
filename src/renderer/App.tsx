import React, { useState, useEffect } from 'react';
import FileSelector from './components/FileSelector';
import ProcessingOptions from './components/ProcessingOptions';
import ProgressDisplay from './components/ProgressDisplay';
import Header from './components/Header';
import Footer from './components/Footer';

export interface ProcessingState {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  inputFile: string | null;
  outputFile: string | null;
  error: string | null;
}

export interface Options {
  noiseReductionLevel: 'light' | 'medium' | 'heavy' | 'extreme';
  preserveVoice: boolean;
  outputFormat: string;
  outputDir: string;
}

const App: React.FC = () => {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    inputFile: null,
    outputFile: null,
    error: null
  });

  const [options, setOptions] = useState<Options>({
    noiseReductionLevel: 'medium',
    preserveVoice: true,
    outputFormat: 'mp3',
    outputDir: ''
  });

  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    // Load settings
    loadSettings();
    loadAppVersion();

    // Setup event listeners
    window.electronAPI.onProcessingProgress((progress) => {
      setProcessingState(prev => ({ ...prev, progress }));
    });

    window.electronAPI.onUpdateAvailable((info) => {
      console.log('Update available:', info);
    });

    window.electronAPI.onUpdateDownloaded((info) => {
      console.log('Update downloaded:', info);
      window.electronAPI.showNotification(
        'Update Ready',
        'A new version has been downloaded. Restart the app to install.'
      );
    });
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings.noiseReduction) {
        setOptions(prev => ({
          ...prev,
          noiseReductionLevel: settings.noiseReduction.level || 'medium',
          preserveVoice: settings.noiseReduction.preserveVoice !== false
        }));
      }
      if (settings.lastOutputDir) {
        setOptions(prev => ({ ...prev, outputDir: settings.lastOutputDir }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadAppVersion = async () => {
    try {
      const version = await window.electronAPI.getAppVersion();
      setAppVersion(version);
    } catch (error) {
      console.error('Failed to load app version:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await window.electronAPI.saveSettings({
        noiseReduction: {
          level: options.noiseReductionLevel,
          preserveVoice: options.preserveVoice
        },
        lastOutputDir: options.outputDir
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleFileSelect = (filePath: string) => {
    setProcessingState({
      status: 'idle',
      progress: 0,
      inputFile: filePath,
      outputFile: null,
      error: null
    });
  };

  const handleOptionsChange = (newOptions: Partial<Options>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  };

  const handleProcess = async () => {
    if (!processingState.inputFile) {
      return;
    }

    // Save settings before processing
    await saveSettings();

    const inputFileName = processingState.inputFile.split('\\').pop()?.split('/').pop() || 'output';
    const baseName = inputFileName.replace(/\.[^/.]+$/, '');
    const outputFileName = `${baseName}_cleaned.${options.outputFormat}`;

    let outputDir = options.outputDir;
    if (!outputDir) {
      const selectedDir = await window.electronAPI.selectOutputDir();
      if (!selectedDir) {
        return;
      }
      outputDir = selectedDir;
      setOptions(prev => ({ ...prev, outputDir }));
    }

    const outputPath = `${outputDir}\\${outputFileName}`;

    setProcessingState(prev => ({
      ...prev,
      status: 'processing',
      progress: 0,
      error: null,
      outputFile: outputPath
    }));

    try {
      const result = await window.electronAPI.processAudio(
        processingState.inputFile,
        outputPath,
        {
          noiseReductionLevel: options.noiseReductionLevel,
          preserveVoice: options.preserveVoice,
          outputFormat: options.outputFormat
        }
      );

      if (result.success) {
        setProcessingState(prev => ({
          ...prev,
          status: 'completed',
          progress: 100
        }));

        await window.electronAPI.showNotification(
          'Processing Complete',
          'Your audio file has been cleaned successfully!'
        );
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      setProcessingState(prev => ({
        ...prev,
        status: 'error',
        error: (error as Error).message
      }));

      await window.electronAPI.showNotification(
        'Processing Failed',
        (error as Error).message
      );
    }
  };

  const handleReset = () => {
    setProcessingState({
      status: 'idle',
      progress: 0,
      inputFile: null,
      outputFile: null,
      error: null
    });
  };

  const handleOpenOutputLocation = async () => {
    if (processingState.outputFile) {
      await window.electronAPI.openFileLocation(processingState.outputFile);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-win11-bg">
      <Header version={appVersion} />

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-win11-text mb-3">
              AI Audio Noise Reducer
            </h1>
            <p className="text-lg text-win11-textSecondary">
              Remove background noise from your audio files with advanced AI technology
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <FileSelector
                selectedFile={processingState.inputFile}
                onFileSelect={handleFileSelect}
                disabled={processingState.status === 'processing'}
              />

              <ProcessingOptions
                options={options}
                onChange={handleOptionsChange}
                disabled={processingState.status === 'processing'}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <ProgressDisplay
                state={processingState}
                onProcess={handleProcess}
                onReset={handleReset}
                onOpenLocation={handleOpenOutputLocation}
                disabled={!processingState.inputFile}
              />

              {/* Tips Card */}
              <div className="win11-card">
                <h3 className="text-lg font-semibold text-win11-text mb-3">
                  💡 Tips for Best Results
                </h3>
                <ul className="space-y-2 text-sm text-win11-textSecondary">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Start with "Medium" noise reduction and adjust if needed</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Enable "Preserve Voice Quality" for vocal recordings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Use "Light" for subtle background noise</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Use "Heavy" or "Extreme" for very noisy recordings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Supported formats: MP3, WAV, OGG, FLAC, M4A, AAC</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="win11-card text-center">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-semibold text-win11-text mb-2">AI-Powered</h3>
              <p className="text-sm text-win11-textSecondary">
                Advanced algorithms detect and remove unwanted noise
              </p>
            </div>
            <div className="win11-card text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-win11-text mb-2">Fast Processing</h3>
              <p className="text-sm text-win11-textSecondary">
                Efficiently process files with optimized performance
              </p>
            </div>
            <div className="win11-card text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-win11-text mb-2">High Quality</h3>
              <p className="text-sm text-win11-textSecondary">
                Maintain audio quality while removing noise
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
