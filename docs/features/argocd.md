# ArgoCD Features Documentation

## Overview

ArgoCD integration features for managing GitOps applications directly from VS Code.

## Planned Features

### Application Management

#### Multi-Instance Support
- Connect to multiple ArgoCD servers simultaneously
- Switch between different ArgoCD instances
- Secure credential storage using VS Code SecretStorage API

#### Application Tree View
- View all applications grouped by:
  - Projects
  - Clusters
  - Namespaces
- Real-time health and sync status indicators
- Quick actions from context menu

### Application Operations

#### Sync Operations
- One-click application sync
- Hard refresh option
- Selective resource sync
- Sync with prune option

#### Application Details
- Detailed application view in webview panel
- Resource tree visualization (similar to ArgoCD UI)
- Live sync status monitoring
- Deployment history
- Rollback capabilities
- Diff view between Git and live state

### Template Management

#### Template Library
- Create reusable application templates
- Convert existing applications to templates
- Built-in templates for common patterns:
  - Helm applications
  - Kustomize applications
  - Directory applications

#### Template Usage
- Create new applications from templates
- Template variables and substitution
- Template validation

### YAML Integration

#### CodeLens Support
- Inline actions for `Application` resources:
  - "Create Application"
  - "Sync Application"
  - "Validate YAML"
- Inline actions for `ApplicationSet` resources
- Status indicators in editor

#### Validation
- Real-time YAML validation
- Schema validation against ArgoCD CRDs
- Syntax highlighting

## Configuration

### Settings

```json
{
  "extendedK8s.argocd.enabled": true,
  "extendedK8s.argocd.servers": [
    {
      "name": "Production",
      "url": "https://argocd.example.com"
    },
    {
      "name": "Staging",
      "url": "https://argocd-staging.example.com"
    }
  ]
}
```

### Authentication

- Token-based authentication
- SSO support
- Secure credential storage
- Automatic token refresh

## Commands

- **ArgoCD: Connect to Server** - Add new ArgoCD server
- **ArgoCD: Sync Application** - Sync selected application
- **ArgoCD: Refresh Application** - Refresh application state
- **ArgoCD: View Application Details** - Open detailed view
- **ArgoCD: Create from Template** - Create app from template

## Status: Planned

These features are planned for future implementation. Current status: **Not yet implemented**.

## Implementation Priority

1. **Phase 1**: Basic connection and application listing
2. **Phase 2**: Sync operations and status monitoring
3. **Phase 3**: Template management
4. **Phase 4**: Advanced features (diff view, rollback)
