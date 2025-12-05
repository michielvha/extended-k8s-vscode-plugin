# Publishing VS Code Extension

This document explains how to publish the Extended Kubernetes VS Code Extension to the marketplace.

## Prerequisites

### 1. Create a Publisher Account

1. Go to [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. Sign in with your Microsoft account
3. Create a new publisher or use an existing one
4. Note your publisher ID (you'll need this in `package.json`)

### 2. Generate Personal Access Token (PAT)

#### For VS Code Marketplace:

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Click on your profile → Security → Personal Access Tokens
3. Click "New Token"
4. Configure:
   - **Name**: `VS Code Extension Publishing`
   - **Organization**: All accessible organizations
   - **Expiration**: Custom (set to 1 year or longer)
   - **Scopes**: Custom defined → **Marketplace** → **Manage**
5. Click "Create" and **copy the token immediately** (you won't see it again!)

#### For Open VSX Registry (Optional):

1. Go to [Open VSX](https://open-vsx.org/)
2. Sign in with GitHub
3. Go to Settings → Access Tokens
4. Generate a new token

### 3. Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Add the following secrets:
   - **Name**: `VSCE_PAT`
   - **Value**: Your VS Code Marketplace PAT
5. (Optional) Add Open VSX token:
   - **Name**: `OPEN_VSX_TOKEN`
   - **Value**: Your Open VSX token

## Publishing Methods

### Method 1: Automatic Publishing via GitHub Release (Recommended)

1. Update the version in `package.json`:
   ```bash
   npm version patch  # or minor, or major
   ```

2. Push the changes and tags:
   ```bash
   git push && git push --tags
   ```

3. Create a GitHub Release:
   - Go to your repository → Releases → "Draft a new release"
   - Choose the tag you just created
   - Fill in release notes
   - Click "Publish release"

4. The GitHub Action will automatically:
   - Build the extension
   - Run tests
   - Package the VSIX
   - Publish to VS Code Marketplace
   - Publish to Open VSX Registry (optional)

### Method 2: Manual Workflow Dispatch

1. Go to your repository → Actions → "Publish Extension"
2. Click "Run workflow"
3. Select the branch
4. (Optional) Specify a version
5. Click "Run workflow"

### Method 3: Local Publishing (For Testing)

```bash
# Install vsce globally
npm install -g @vscode/vsce

# Login to your publisher
vsce login <your-publisher-id>

# Package the extension
vsce package

# Publish the extension
vsce publish
```

## Continuous Integration

The CI workflow (`.github/workflows/ci.yml`) runs on every push and PR to:
- Install dependencies
- Lint code
- Run tests
- Compile the extension
- Package the VSIX
- Upload the VSIX as an artifact

## Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version: Incompatible API changes
- **MINOR** version: New functionality (backwards compatible)
- **PATCH** version: Bug fixes (backwards compatible)

Use npm version commands:
```bash
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.1 → 0.2.0
npm version major  # 0.2.0 → 1.0.0
```

## Troubleshooting

### "Failed to publish: 401 Unauthorized"
- Your PAT has expired or is invalid
- Regenerate the PAT and update the GitHub secret

### "Publisher not found"
- Update the `publisher` field in `package.json` with your publisher ID

### "Extension already exists with this version"
- Increment the version in `package.json`
- Or unpublish the existing version first (not recommended)

### "Tests failed"
- The workflow continues even if tests fail (for now)
- Fix the tests before publishing to production

## Resources

- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce CLI Documentation](https://github.com/microsoft/vscode-vsce)
- [HaaLeo/publish-vscode-extension Action](https://github.com/HaaLeo/publish-vscode-extension)
- [Open VSX Registry](https://open-vsx.org/)
