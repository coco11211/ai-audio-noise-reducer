import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { spawn } from 'child_process';
import log from 'electron-log';

export interface ProcessingOptions {
  noiseReductionLevel: 'light' | 'medium' | 'heavy' | 'extreme';
  preserveVoice: boolean;
  outputFormat?: string;
  sampleRate?: number;
  bitrate?: string;
}

export class AudioProcessor {
  private ffmpegPath: string;
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'ai-audio-noise-reducer');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    // FFmpeg path - in production, bundle FFmpeg with the app
    this.ffmpegPath = this.findFFmpeg();
  }

  private findFFmpeg(): string {
    // Try to find FFmpeg in common locations
    const possiblePaths = [
      'ffmpeg',
      'C:\\ffmpeg\\bin\\ffmpeg.exe',
      path.join(process.resourcesPath, 'ffmpeg.exe'),
      path.join(__dirname, '../../resources/ffmpeg.exe')
    ];

    for (const ffmpegPath of possiblePaths) {
      try {
        // This is a simple check - in production you'd verify it works
        return ffmpegPath;
      } catch (error) {
        continue;
      }
    }

    return 'ffmpeg'; // Default fallback
  }

  public async processAudio(
    inputPath: string,
    outputPath: string,
    options: ProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    log.info('Starting audio processing', { inputPath, outputPath, options });

    // Validate input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error('Input file does not exist');
    }

    // Create temporary files
    const tempProfile = path.join(this.tempDir, `noise-profile-${Date.now()}.prof`);
    const tempNoiseSample = path.join(this.tempDir, `noise-sample-${Date.now()}.wav`);

    try {
      // Step 1: Extract a noise sample (first 0.5 seconds)
      log.info('Step 1: Extracting noise sample');
      await this.extractNoiseSample(inputPath, tempNoiseSample);
      if (onProgress) onProgress(20);

      // Step 2: Create noise profile
      log.info('Step 2: Creating noise profile');
      await this.createNoiseProfile(tempNoiseSample, tempProfile, options);
      if (onProgress) onProgress(40);

      // Step 3: Apply noise reduction
      log.info('Step 3: Applying noise reduction');
      await this.applyNoiseReduction(inputPath, outputPath, tempProfile, options, (p) => {
        if (onProgress) onProgress(40 + p * 0.6); // Map 0-100 to 40-100
      });

      log.info('Audio processing completed successfully');
    } catch (error) {
      log.error('Audio processing failed:', error);
      throw error;
    } finally {
      // Cleanup temporary files
      this.cleanupTempFiles([tempProfile, tempNoiseSample]);
    }
  }

  private extractNoiseSample(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-i', inputPath,
        '-t', '0.5', // First 0.5 seconds
        '-ar', '44100', // Sample rate
        '-ac', '1', // Mono
        '-y', // Overwrite
        outputPath
      ];

      const process = spawn(this.ffmpegPath, args);

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  private createNoiseProfile(
    noiseSamplePath: string,
    profilePath: string,
    options: ProcessingOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create a noise profile using advanced FFmpeg filters
      // This simulates noise profiling by analyzing the frequency spectrum
      const sensitivity = this.getNoiseReductionSensitivity(options.noiseReductionLevel);

      // For now, we'll create a basic profile file
      // In a real implementation, you'd use more sophisticated analysis
      const profileData = {
        sensitivity,
        preserveVoice: options.preserveVoice,
        timestamp: Date.now()
      };

      fs.writeFileSync(profilePath, JSON.stringify(profileData));
      resolve();
    });
  }

  private applyNoiseReduction(
    inputPath: string,
    outputPath: string,
    profilePath: string,
    options: ProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));

      // Build FFmpeg filter chain for noise reduction
      const filters = this.buildNoiseReductionFilters(options, profile);

      const args = [
        '-i', inputPath,
        '-af', filters,
        '-ar', (options.sampleRate || 44100).toString(),
        '-b:a', options.bitrate || '192k',
        '-y', // Overwrite
        outputPath
      ];

      log.info('FFmpeg command:', this.ffmpegPath, args.join(' '));

      const ffmpegProcess = spawn(this.ffmpegPath, args);
      let duration = 0;
      let currentTime = 0;

      ffmpegProcess.stderr.on('data', (data) => {
        const output = data.toString();

        // Parse duration
        const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
        if (durationMatch) {
          const hours = parseInt(durationMatch[1]);
          const minutes = parseInt(durationMatch[2]);
          const seconds = parseInt(durationMatch[3]);
          duration = hours * 3600 + minutes * 60 + seconds;
        }

        // Parse current time
        const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})/);
        if (timeMatch && duration > 0) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const seconds = parseInt(timeMatch[3]);
          currentTime = hours * 3600 + minutes * 60 + seconds;

          const progress = Math.min((currentTime / duration) * 100, 100);
          if (onProgress) onProgress(progress);
        }
      });

      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          if (onProgress) onProgress(100);
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpegProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  private buildNoiseReductionFilters(options: ProcessingOptions, profile: any): string {
    const filters = [];

    // High-pass filter to remove low-frequency noise
    if (options.preserveVoice) {
      filters.push('highpass=f=80'); // Remove frequencies below 80Hz (below typical voice)
    } else {
      filters.push('highpass=f=20');
    }

    // Low-pass filter to remove high-frequency noise
    if (options.preserveVoice) {
      filters.push('lowpass=f=10000'); // Keep frequencies below 10kHz (above typical voice)
    }

    // Adaptive noise reduction using afftdn (FFmpeg's denoising filter)
    const noiseReduction = this.getNoiseReductionStrength(options.noiseReductionLevel);
    filters.push(`afftdn=nr=${noiseReduction}:nf=-25:tn=1`);

    // Additional filtering based on level
    if (options.noiseReductionLevel === 'heavy' || options.noiseReductionLevel === 'extreme') {
      // Add gate to remove quiet noise
      filters.push('agate=threshold=0.02:ratio=2:attack=5:release=50');
    }

    if (options.noiseReductionLevel === 'extreme') {
      // Very aggressive noise reduction
      filters.push('anlmdn=s=10:p=0.002:r=0.002:m=15');
    }

    // Normalize audio to prevent volume changes
    filters.push('loudnorm=I=-16:TP=-1.5:LRA=11');

    // Voice enhancement if preserveVoice is enabled
    if (options.preserveVoice) {
      // Emphasize voice frequencies (200Hz - 3kHz)
      filters.push('equalizer=f=1000:width_type=o:width=2:g=2');
    }

    return filters.join(',');
  }

  private getNoiseReductionSensitivity(level: string): number {
    switch (level) {
      case 'light': return 0.3;
      case 'medium': return 0.5;
      case 'heavy': return 0.7;
      case 'extreme': return 0.9;
      default: return 0.5;
    }
  }

  private getNoiseReductionStrength(level: string): number {
    switch (level) {
      case 'light': return 12;
      case 'medium': return 20;
      case 'heavy': return 30;
      case 'extreme': return 40;
      default: return 20;
    }
  }

  private cleanupTempFiles(files: string[]): void {
    files.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          log.info('Cleaned up temp file:', file);
        }
      } catch (error) {
        log.error('Failed to cleanup temp file:', file, error);
      }
    });
  }

  public getSupportedFormats(): string[] {
    return ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
  }

  public async getAudioInfo(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const args = [
        '-i', filePath,
        '-hide_banner'
      ];

      const process = spawn(this.ffmpegPath, args);
      let output = '';

      process.stderr.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', () => {
        // Parse audio information from FFmpeg output
        const info = {
          duration: this.parseDuration(output),
          bitrate: this.parseBitrate(output),
          sampleRate: this.parseSampleRate(output),
          channels: this.parseChannels(output)
        };
        resolve(info);
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  private parseDuration(output: string): number {
    const match = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
    }
    return 0;
  }

  private parseBitrate(output: string): string {
    const match = output.match(/bitrate: (\d+ kb\/s)/);
    return match ? match[1] : 'unknown';
  }

  private parseSampleRate(output: string): number {
    const match = output.match(/(\d+) Hz/);
    return match ? parseInt(match[1]) : 44100;
  }

  private parseChannels(output: string): number {
    if (output.includes('stereo')) return 2;
    if (output.includes('mono')) return 1;
    return 2;
  }
}
