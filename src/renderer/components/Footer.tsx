import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-win11-border px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-win11-textSecondary">
        <div>
          © {currentYear} AI Audio Noise Reducer. All rights reserved.
        </div>
        <div className="flex items-center space-x-4">
          <span>Powered by FFmpeg & AI</span>
          <span>•</span>
          <span>Windows 11 Ready</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
