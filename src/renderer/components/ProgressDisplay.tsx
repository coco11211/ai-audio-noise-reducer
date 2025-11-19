import React from 'react';
import { ProcessingState } from '../App';

interface ProgressDisplayProps {
  state: ProcessingState;
  onProcess: () => void;
  onReset: () => void;
  onOpenLocation: () => void;
  disabled?: boolean;
}

const ProgressDisplay: React.FC<ProgressDisplayProps> = ({
  state,
  onProcess,
  onReset,
  onOpenLocation,
  disabled
}) => {
  const getStatusBadge = () => {
    switch (state.status) {
      case 'idle':
        return <span className="status-idle">Ready</span>;
      case 'processing':
        return <span className="status-processing">Processing...</span>;
      case 'completed':
        return <span className="status-success">Completed ✓</span>;
      case 'error':
        return <span className="status-error">Error ✕</span>;
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    switch (state.status) {
      case 'idle':
        return '⏳';
      case 'processing':
        return '⚙️';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="win11-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-win11-text">Processing Status</h2>
        {getStatusBadge()}
      </div>

      {/* Status Display */}
      <div className="mb-6 text-center py-8">
        <div className="text-6xl mb-4">{getStatusIcon()}</div>
        <h3 className="text-lg font-medium text-win11-text mb-2">
          {state.status === 'idle' && 'Ready to Process'}
          {state.status === 'processing' && 'Processing Audio...'}
          {state.status === 'completed' && 'Processing Complete!'}
          {state.status === 'error' && 'Processing Failed'}
        </h3>
        <p className="text-sm text-win11-textSecondary">
          {state.status === 'idle' && 'Select a file and click "Start Processing" to begin'}
          {state.status === 'processing' && `Progress: ${Math.round(state.progress)}%`}
          {state.status === 'completed' && 'Your audio file has been cleaned successfully'}
          {state.status === 'error' && state.error}
        </p>
      </div>

      {/* Progress Bar */}
      {state.status === 'processing' && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="progress-bar"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-win11-textSecondary">
            <span>Processing...</span>
            <span>{Math.round(state.progress)}%</span>
          </div>
        </div>
      )}

      {/* Output File Info */}
      {state.status === 'completed' && state.outputFile && (
        <div className="mb-6 p-4 bg-green-50 rounded-win11-sm border border-green-200">
          <p className="text-sm font-medium text-green-900 mb-2">📁 Output File</p>
          <p className="text-xs font-mono text-green-800 break-all mb-3">
            {state.outputFile}
          </p>
          <button
            className="win11-button-secondary text-sm w-full"
            onClick={onOpenLocation}
          >
            Open File Location
          </button>
        </div>
      )}

      {/* Error Display */}
      {state.status === 'error' && state.error && (
        <div className="mb-6 p-4 bg-red-50 rounded-win11-sm border border-red-200">
          <p className="text-sm font-medium text-red-900 mb-2">Error Details</p>
          <p className="text-xs text-red-800">{state.error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {state.status === 'idle' && (
          <button
            className="win11-button-primary w-full text-lg py-3"
            onClick={onProcess}
            disabled={disabled}
          >
            Start Processing
          </button>
        )}

        {state.status === 'processing' && (
          <button className="win11-button-secondary w-full" disabled>
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          </button>
        )}

        {(state.status === 'completed' || state.status === 'error') && (
          <>
            <button
              className="win11-button-primary w-full"
              onClick={onProcess}
              disabled={disabled}
            >
              Process Another File
            </button>
            <button
              className="win11-button-secondary w-full"
              onClick={onReset}
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Processing Time Estimate */}
      {state.status === 'idle' && !disabled && (
        <div className="mt-4 p-3 bg-gray-50 rounded-win11-sm">
          <p className="text-xs text-win11-textSecondary text-center">
            💡 Processing time depends on file size and selected options
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressDisplay;
