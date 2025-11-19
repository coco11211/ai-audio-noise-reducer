# Contributing to AI Audio Noise Reducer

First off, thank you for considering contributing to AI Audio Noise Reducer! It's people like you that make this tool better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Getting Started

### Prerequisites

- Node.js v18.x or higher
- npm v9.x or higher
- FFmpeg installed and in PATH
- Git
- A code editor (VS Code recommended)

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-audio-noise-reducer.git
   cd ai-audio-noise-reducer
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/ai-audio-noise-reducer.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Development Process

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical fixes

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(audio): add batch processing support
fix(ui): correct progress bar calculation
docs(readme): update installation instructions
```

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**
   ```bash
   npm run lint
   npm run type-check
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Test the production build**
   ```bash
   npm run package:dir
   ```

### Submitting a Pull Request

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to GitHub and create a Pull Request
   - Fill out the PR template completely
   - Link related issues

3. **PR Requirements**
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings
   - [ ] Tests added/updated
   - [ ] All tests pass
   - [ ] Builds successfully

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any` when possible
- Use interfaces for object shapes
- Use enums for fixed sets of values

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Avoid prop drilling, use context when needed

### File Organization

```
src/
├── main/           # Electron main process
├── renderer/       # React application
│   ├── components/ # Reusable components
│   ├── hooks/      # Custom hooks
│   ├── utils/      # Utility functions
│   └── types/      # TypeScript types
```

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase with 'I' prefix (optional)

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Max line length: 100 characters
- Use meaningful variable names

### Example

```typescript
// Good
interface AudioOptions {
  noiseReductionLevel: 'light' | 'medium' | 'heavy';
  preserveVoice: boolean;
}

const processAudio = async (
  filePath: string,
  options: AudioOptions
): Promise<void> => {
  // Implementation
};

// Avoid
const process = async (f: string, o: any) => {
  // Implementation
};
```

## Testing

### Manual Testing

Test your changes thoroughly:

1. **File Selection**
   - Browse file selection
   - Drag and drop
   - Invalid file handling

2. **Processing**
   - All noise reduction levels
   - All output formats
   - Progress tracking
   - Error scenarios

3. **UI/UX**
   - Responsive design
   - All buttons and controls
   - Visual feedback
   - Accessibility

4. **Production Build**
   - Clean install
   - First-run experience
   - Settings persistence
   - Auto-update

### Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Builds successfully
- [ ] Works on Windows 11
- [ ] No performance regressions
- [ ] Accessibility maintained
- [ ] Documentation updated

## Areas for Contribution

### High Priority

- Batch processing support
- Audio preview functionality
- Custom noise profiles
- Performance optimizations

### Medium Priority

- Additional audio formats
- UI/UX improvements
- Better error messages
- Accessibility enhancements

### Low Priority

- Themes support
- Internationalization
- Additional platforms (macOS, Linux)
- Cloud integration

## Questions?

- Check existing issues and discussions
- Read the documentation
- Ask in discussions section
- Contact maintainers

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Special thanks in documentation

---

Thank you for contributing to AI Audio Noise Reducer! 🎉
