import React, { useState, useRef } from 'react';

interface FileSelectorProps {
  selectedFile: string | null;
  onFileSelect: (filePath: string) => void;
  disabled?: boolean;
}

const FileSelector: React.FC<FileSelectorProps> = ({ selectedFile, onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma'];
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext && validExtensions.includes(ext)) {
        onFileSelect(file.path);
      } else {
        alert('Please select a valid audio file (MP3, WAV, OGG, FLAC, M4A, AAC, WMA)');
      }
    }
  };

  const handleBrowseClick = async () => {
    if (disabled) return;

    const filePath = await window.electronAPI.selectFile();
    if (filePath) {
      onFileSelect(filePath);
    }
  };

  const getFileName = () => {
    if (!selectedFile) return null;
    return selectedFile.split('\\').pop()?.split('/').pop();
  };

  return (
    <div className="win11-card">
      <h2 className="text-xl font-semibold text-win11-text mb-4">Select Audio File</h2>

      <div
        className={`drop-zone ${isDragging ? 'drop-zone-active' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <div className="p-12 text-center">
          {selectedFile ? (
            <>
              <div className="text-5xl mb-4">🎵</div>
              <p className="text-lg font-medium text-win11-text mb-2">
                {getFileName()}
              </p>
              <p className="text-sm text-win11-textSecondary mb-4">
                File selected successfully
              </p>
              {!disabled && (
                <button
                  className="win11-button-secondary text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowseClick();
                  }}
                >
                  Choose Different File
                </button>
              )}
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">📁</div>
              <p className="text-lg font-medium text-win11-text mb-2">
                Drag & Drop Audio File
              </p>
              <p className="text-sm text-win11-textSecondary mb-4">
                or click to browse
              </p>
              <button className="win11-button-primary">
                Browse Files
              </button>
            </>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="mt-4 p-4 bg-blue-50 rounded-win11-sm border border-blue-200">
          <p className="text-sm text-win11-textSecondary mb-1">File Path:</p>
          <p className="text-sm font-mono text-win11-text break-all">{selectedFile}</p>
        </div>
      )}
    </div>
  );
};

export default FileSelector;
