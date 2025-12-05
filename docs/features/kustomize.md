# Kustomize Features Documentation

## Overview

This document details all Kustomize-specific features implemented in the Extended Kubernetes VS Code Extension.

## Navigation Features

### Supported Fields

The extension provides Ctrl+Click navigation and clickable links for the following Kustomize fields:

#### Core Fields
- **`resources`** - Navigate to resource YAML files or directories (supports `../` paths)
- **`bases`** - Navigate to base kustomization directories (supports relative paths like `../../base`)
- **`components`** - Navigate to component directories
- **`patches`** - Navigate to patch files (supports both list format and `path:` field)

#### Patch Fields (Deprecated but Supported)
- **`patchesStrategicMerge`** - Navigate to strategic merge patch files
- **`patchesJson6902`** - Navigate to JSON patch files with `path:` field support

#### Helm Support
- **`helmGlobals.chartHome`** - Navigate to Helm chart directory
- **`helmCharts[].includeCRDs`** - Support for Helm chart configurations

#### Generators
- **`configMapGenerator.files`** - Navigate to ConfigMap source files
- **`secretGenerator.files`** - Navigate to Secret source files
- **`configMapGenerator.envs`** - Navigate to environment files
- **`secretGenerator.envs`** - Navigate to environment files

### Navigation Behavior

#### File Navigation
When clicking on a file reference:
- Opens the file in the editor
- Positions cursor at the beginning of the file
- Works with relative paths (`../base/deployment.yaml`)
- Supports files with special characters (dots, dashes, underscores)

#### Directory Navigation
When clicking on a directory reference:
- Automatically finds `kustomization.yaml` or `kustomization.yml` in the directory
- Opens the kustomization file
- Falls back to `Kustomization` (capital K) if needed

### Visual Feedback

- **Underlined links** - File/directory references appear as underlined links on hover
- **Full path highlighting** - Entire filename is highlighted, including special characters
- **Tooltips** - Shows "Go to {filename}" on hover
- **Color coding** - Uses VS Code's link color scheme

## Diagnostics

### Real-time Validation

The extension validates kustomization files as you type and provides immediate feedback:

#### Error Detection

**Broken File References**
```yaml
resources:
  - missing-file.yaml  # ❌ Error: resource not found: missing-file.yaml
```

**Missing Kustomization in Bases**
```yaml
bases:
  - ../empty-dir  # ❌ Error: No kustomization.yaml found in base: ../empty-dir
```

**Missing Kustomization in Components**
```yaml
components:
  - ./component-without-kustomization  # ❌ Error: No kustomization.yaml found in component
```

#### Warnings

**Deprecated Fields**
```yaml
patchesStrategicMerge:  # ⚠️ Warning: patchesStrategicMerge is deprecated in Kustomize v5+. Use patches instead.
  - patch.yaml
```

```yaml
patchesJson6902:  # ⚠️ Warning: patchesJson6902 is deprecated in Kustomize v5+. Use patches instead.
  - target:
      kind: Deployment
    path: patch.yaml
```

### Diagnostic Features

- **Auto-update on save** - Diagnostics refresh when you save the file
- **Auto-update on change** - Diagnostics update as you type
- **File watching** - Detects when referenced files are created/deleted
- **Clear error messages** - Specific, actionable error descriptions

## Tree View

### Kustomize Explorer

A dedicated tree view in the Explorer sidebar showing your Kustomize structure:

#### Root Level
- Shows all `kustomization.yaml` files in the workspace
- Displays directory name as the label
- Collapsible/expandable nodes

#### Hierarchy Display

**Bases Section**
- Groups all base references
- Shows relative path to base
- Click to navigate to base kustomization

**Components Section**
- Groups all component references
- Shows relative path to component
- Click to navigate to component kustomization

**Resources Section**
- Shows count: "Resources (5)"
- Lists all resource files
- Click to open resource file

### Tree View Features

- **Auto-refresh** - Updates when kustomization files change
- **File watching** - Detects file creation/deletion/modification
- **Icons** - Visual indicators for different item types:
  - 📄 Kustomization files
  - 📁 Folders (Bases, Components, Resources)
  - 📂 Base directories
  - 📦 Component directories
  - 📄 Resource files

## Configuration

### Extension Settings

```json
{
  "extendedK8s.kustomize.enabled": true,
  "extendedK8s.kustomize.kustomizePath": "kustomize",
  "extendedK8s.kustomize.autoPreview": false
}
```

### Settings Description

- **`enabled`** - Enable/disable all Kustomize features
- **`kustomizePath`** - Path to kustomize CLI executable
- **`autoPreview`** - Automatically build preview on save (future feature)

## Commands

### Available Commands

- **Kustomize: Preview Build Output** - Preview rendered YAML (coming soon)
- **Kustomize: Build** - Run `kustomize build` in terminal

## Supported File Patterns

The extension activates for:
- `**/kustomization.yaml`
- `**/kustomization.yml`
- `**/Kustomization` (capital K variant)

## Examples

### Basic Kustomization
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml      # ← Click to open
  - service.yaml         # ← Click to open

bases:
  - ../base              # ← Click to navigate to base/kustomization.yaml

namespace: my-app
```

### With Helm Support
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

helmGlobals:
  chartHome: helm        # ← Click to navigate to helm directory

helmCharts:
  - name: crossplane
    repo: https://charts.crossplane.io/stable
    version: v1.20.0
```

### With Generators
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

configMapGenerator:
  - name: app-config
    files:
      - config.properties  # ← Click to open
      - app.yaml          # ← Click to open

secretGenerator:
  - name: db-credentials
    envs:
      - .env.secret       # ← Click to open
```

## Future Features

- **Live Preview** - Side-by-side view of rendered YAML
- **Diff View** - Compare base vs overlay
- **Auto-completion** - Path suggestions for file references
- **Hover Documentation** - Show field descriptions
- **Find All References** - See where a file is used
- **Refactoring** - Rename/move files with automatic updates
