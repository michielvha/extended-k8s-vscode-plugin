# Extended Kubernetes VS Code Extension

Enhanced Kubernetes extension with advanced support for **Kustomize**, **ArgoCD**, and **FluxCD**.

## Features

### 🎯 Kustomize Support
- **Smart Navigation**: Ctrl+Click to jump to resources, bases, components, and patches
- **Real-time Validation**: Detect broken file references and missing kustomization files
- **Tree View**: Visual hierarchy of your Kustomize structure
- **Deprecation Warnings**: Alerts for deprecated fields (patchesStrategicMerge, patchesJson6902)
- **Live Preview**: See rendered YAML output (coming soon)

### 🔄 FluxCD Integration
- **Variable Highlighting**: Syntax highlighting for Flux variable substitutions
- **Resource Management**: Tree view for GitRepositories, HelmReleases, Kustomizations
- **Reconciliation**: One-click reconciliation triggers
- **Image Automation**: Manage ImageRepository and ImagePolicy resources

### 🚀 ArgoCD Integration
- **Multi-Instance Support**: Connect to multiple ArgoCD servers
- **Application Management**: View, sync, and manage applications
- **Template Library**: Create and reuse application templates
- **YAML CodeLens**: Inline actions for Application and ApplicationSet files

## Installation

1. Clone this repository
2. Run `npm install`
3. Press F5 to launch the extension in debug mode

## Configuration

```json
{
  "extendedK8s.kustomize.enabled": true,
  "extendedK8s.kustomize.kustomizePath": "kustomize",
  "extendedK8s.flux.enabled": true,
  "extendedK8s.argocd.enabled": true,
  "extendedK8s.argocd.servers": [
    {
      "name": "Production",
      "url": "https://argocd.example.com"
    }
  ]
}
```

## Usage

### Kustomize Navigation
1. Open any `kustomization.yaml` file
2. Ctrl+Click on any resource, base, or component path
3. View the Kustomize tree in the Explorer sidebar

### Flux CD
1. Connect to a Flux-enabled cluster
2. View Flux resources in the Flux CD tree view
3. Right-click to reconcile resources

### ArgoCD
1. Configure ArgoCD servers in settings
2. View applications in the ArgoCD tree view
3. Sync applications with one click

## Development

See [kustomize_extension_design.md](./kustomize_extension_design.md) for the complete design plan and architecture.