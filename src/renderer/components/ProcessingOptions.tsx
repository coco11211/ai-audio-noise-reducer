import React from 'react';
import { Options } from '../App';

interface ProcessingOptionsProps {
  options: Options;
  onChange: (options: Partial<Options>) => void;
  disabled?: boolean;
}

const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({ options, onChange, disabled }) => {
  return (
    <div className="win11-card">
      <h2 className="text-xl font-semibold text-win11-text mb-4">Processing Options</h2>

      <div className="space-y-4">
        {/* Noise Reduction Level */}
        <div>
          <label className="win11-label">
            Noise Reduction Level
          </label>
          <select
            className="win11-select"
            value={options.noiseReductionLevel}
            onChange={(e) => onChange({ noiseReductionLevel: e.target.value as any })}
            disabled={disabled}
          >
            <option value="light">Light - Subtle noise removal</option>
            <option value="medium">Medium - Balanced noise reduction</option>
            <option value="heavy">Heavy - Aggressive noise removal</option>
            <option value="extreme">Extreme - Maximum noise reduction</option>
          </select>
          <p className="text-xs text-win11-textSecondary mt-1">
            {options.noiseReductionLevel === 'light' && 'Best for recordings with minimal background noise'}
            {options.noiseReductionLevel === 'medium' && 'Recommended for most use cases'}
            {options.noiseReductionLevel === 'heavy' && 'For recordings with significant background noise'}
            {options.noiseReductionLevel === 'extreme' && 'Maximum reduction, may affect audio quality'}
          </p>
        </div>

        {/* Preserve Voice Quality */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="preserveVoice"
            checked={options.preserveVoice}
            onChange={(e) => onChange({ preserveVoice: e.target.checked })}
            disabled={disabled}
            className="mt-1 w-4 h-4 text-win11-accent border-win11-border rounded focus:ring-win11-accent"
          />
          <div className="flex-1">
            <label htmlFor="preserveVoice" className="text-sm font-medium text-win11-text cursor-pointer">
              Preserve Voice Quality
            </label>
            <p className="text-xs text-win11-textSecondary mt-1">
              Optimizes noise reduction to maintain natural voice characteristics.
              Recommended for podcasts, interviews, and vocal recordings.
            </p>
          </div>
        </div>

        {/* Output Format */}
        <div>
          <label className="win11-label">
            Output Format
          </label>
          <select
            className="win11-select"
            value={options.outputFormat}
            onChange={(e) => onChange({ outputFormat: e.target.value })}
            disabled={disabled}
          >
            <option value="mp3">MP3 - Universal compatibility</option>
            <option value="wav">WAV - Lossless quality</option>
            <option value="ogg">OGG - Open format</option>
            <option value="flac">FLAC - Lossless compression</option>
            <option value="m4a">M4A - AAC format</option>
          </select>
        </div>

        {/* Output Directory */}
        <div>
          <label className="win11-label">
            Output Directory
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              className="win11-input flex-1"
              value={options.outputDir}
              placeholder="Click 'Browse' to select output directory"
              readOnly
              disabled={disabled}
            />
            <button
              className="win11-button-secondary"
              onClick={async () => {
                const dir = await window.electronAPI.selectOutputDir();
                if (dir) {
                  onChange({ outputDir: dir });
                }
              }}
              disabled={disabled}
            >
              Browse
            </button>
          </div>
          <p className="text-xs text-win11-textSecondary mt-1">
            Processed files will be saved here
          </p>
        </div>

        {/* Quality Preset Info */}
        <div className="p-4 bg-blue-50 rounded-win11-sm border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">🎯 Current Settings</h4>
          <div className="text-xs text-blue-800 space-y-1">
            <div>Level: <span className="font-semibold">{options.noiseReductionLevel.charAt(0).toUpperCase() + options.noiseReductionLevel.slice(1)}</span></div>
            <div>Voice Optimization: <span className="font-semibold">{options.preserveVoice ? 'Enabled' : 'Disabled'}</span></div>
            <div>Output: <span className="font-semibold">{options.outputFormat.toUpperCase()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOptions;
