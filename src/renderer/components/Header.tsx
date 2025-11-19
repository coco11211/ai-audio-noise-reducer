import React from 'react';

interface HeaderProps {
  version: string;
}

const Header: React.FC<HeaderProps> = ({ version }) => {
  return (
    <header className="bg-white border-b border-win11-border px-6 py-4 flex items-center justify-between shadow-win11-sm">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg font-bold">🎵</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-win11-text">AI Audio Noise Reducer</h1>
          {version && (
            <p className="text-xs text-win11-textSecondary">Version {version}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-win11-textSecondary">Production Ready</span>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    </header>
  );
};

export default Header;
