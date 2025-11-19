# Installation Guide

## End Users - Windows 11

### Quick Install (Recommended)

1. **Download the Installer**
   - Go to [Releases](https://github.com/yourusername/ai-audio-noise-reducer/releases)
   - Download `AI-Audio-Noise-Reducer-Setup-1.0.0.exe`
   - File size: ~150MB

2. **Run the Installer**
   - Double-click the downloaded `.exe` file
   - If Windows SmartScreen appears, click "More info" → "Run anyway"
   - Follow the installation wizard:
     - Accept the license agreement
     - Choose installation directory (default: `C:\Program Files\AI Audio Noise Reducer`)
     - Select whether to create desktop shortcut
     - Click "Install"

3. **Launch the Application**
   - Desktop shortcut: Double-click "AI Audio Noise Reducer"
   - Start Menu: Search for "AI Audio Noise Reducer"
   - Installation folder: Run `AI Audio Noise Reducer.exe`

### Portable Version

1. **Download Portable Version**
   - Download `AI-Audio-Noise-Reducer-Portable-1.0.0.exe`

2. **Run Directly**
   - No installation required
   - Place the file anywhere
   - Double-click to run
   - Settings stored in same directory

### System Requirements

- **OS**: Windows 11 (or Windows 10 20H2+)
- **CPU**: Intel i3 / AMD Ryzen 3 or better
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 200MB + space for audio files
- **Display**: 1280x720 minimum resolution

### First Launch

1. **Initial Setup**
   - Application will start automatically after installation
   - Grant permissions if prompted
   - System tray icon will appear

2. **FFmpeg Check**
   - Application will verify FFmpeg availability
   - If not found, you'll be prompted to install

3. **Ready to Use**
   - Drag and drop an audio file to begin
   - Or click "Browse Files" to select a file

## Developers - Development Setup

### Prerequisites

Install these tools before proceeding:

1. **Node.js**
   - Download from [nodejs.org](https://nodejs.org/)
   - Version: 18.x or higher
   - Includes npm package manager

2. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Version: 2.x or higher

3. **FFmpeg**
   - Download from [ffmpeg.org](https://ffmpeg.org/download.html)
   - Extract to a directory
   - Add to system PATH

4. **Code Editor** (Optional but recommended)
   - Visual Studio Code
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/ai-audio-noise-reducer.git
   cd ai-audio-noise-reducer
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   This will install:
   - Electron
   - React
   - TypeScript
   - Webpack
   - All other dependencies

3. **Verify FFmpeg**
   ```bash
   ffmpeg -version
   ```
   Should display FFmpeg version information

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   This will:
   - Compile TypeScript
   - Start webpack dev server
   - Launch Electron app
   - Enable hot reload

5. **Development Mode**
   - Application window opens automatically
   - DevTools are enabled
   - Changes auto-reload
   - Check console for errors

### Building for Production

1. **Build the Application**
   ```bash
   npm run build
   ```
   Compiles all code to `dist/` directory

2. **Package for Windows**
   ```bash
   npm run package
   ```
   Creates installers in `release/` directory:
   - NSIS installer (.exe)
   - Portable version (.exe)

3. **Test Production Build**
   ```bash
   npm run package:dir
   ```
   Creates unpacked version in `release/win-unpacked/`
   - Test without installing
   - Verify functionality
   - Check for errors

### Troubleshooting Installation

#### NPM Install Fails

**Error: `node-gyp` build failed**
```bash
npm install --global --production windows-build-tools
npm install
```

**Error: Permission denied**
```bash
# Run PowerShell as Administrator
npm install
```

#### FFmpeg Not Found

**Add to PATH manually:**
1. Download FFmpeg
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to PATH:
   - Windows Search → "Environment Variables"
   - Edit "Path" under System Variables
   - Add new entry: `C:\ffmpeg\bin`
   - Restart terminal

**Or place in project:**
```bash
# Create resources directory
mkdir resources
# Copy ffmpeg.exe to resources/
copy C:\path\to\ffmpeg.exe resources\
```

#### Development Server Won't Start

**Port 3000 already in use:**
```bash
# Change port in webpack.renderer.config.js
devServer: {
  port: 3001  // Or any available port
}
```

**Module not found errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

#### Build Fails

**TypeScript errors:**
```bash
# Type check
npm run type-check
# Fix errors before building
```

**Webpack errors:**
```bash
# Clear webpack cache
rm -rf dist
npm run build
```

### IDE Setup (VS Code)

#### Recommended Extensions

Install these VS Code extensions:

1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **TypeScript Vue Plugin** - TS support
4. **Electron Debug** - Debugging support

#### Settings

Create `.vscode/settings.json`:
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

#### Debug Configuration

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
      },
      "args": ["."],
      "outputCapture": "std"
    }
  ]
}
```

## Updating

### For Users

**Automatic Updates:**
- Application checks for updates on startup
- Notification appears when update available
- Click "Download" to install
- Restart application after download

**Manual Update:**
1. Download latest installer
2. Run installer (will update existing installation)
3. Launch updated application

### For Developers

**Update Dependencies:**
```bash
# Check for updates
npm outdated

# Update all packages
npm update

# Update specific package
npm update <package-name>
```

**Update Electron:**
```bash
npm install electron@latest --save-dev
```

## Uninstallation

### For Users

**Windows Uninstaller:**
1. Settings → Apps → Apps & Features
2. Find "AI Audio Noise Reducer"
3. Click "Uninstall"
4. Follow prompts

**Manual Removal:**
1. Delete installation directory
2. Delete app data:
   - `%APPDATA%\ai-audio-noise-reducer`
   - `%LOCALAPPDATA%\ai-audio-noise-reducer`
3. Remove desktop shortcut
4. Remove Start Menu entry

### For Developers

```bash
# Remove node_modules
rm -rf node_modules

# Remove build files
rm -rf dist release

# Keep source code
```

## Getting Help

- 📖 Read the [README](README.md)
- 🐛 Check [Issues](https://github.com/yourusername/ai-audio-noise-reducer/issues)
- 💬 Ask in [Discussions](https://github.com/yourusername/ai-audio-noise-reducer/discussions)
- 📧 Contact support

---

Happy noise reducing! 🎵
