# FluxCD Features Documentation

## Overview

FluxCD integration for GitOps continuous delivery with Kubernetes.

## Planned Features

### Resource Management

#### Flux Resource Tree View
- **GitRepositories** - Source repositories
- **HelmRepositories** - Helm chart repositories
- **HelmReleases** - Helm release management
- **Kustomizations** - Kustomize overlays
- **Buckets** - OCI artifact sources
- **ImageRepositories** - Container image sources
- **ImagePolicies** - Image update policies

#### Status Indicators
- ✅ Ready
- 🔄 Reconciling
- ❌ Failed
- ⏸️ Suspended

### Variable Substitution

#### Syntax Highlighting
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${cluster_name}-config  # ← Highlighted variable
data:
  region: ${cluster_region}      # ← Highlighted variable
```

#### Variable Features
- Highlight `${VAR}` placeholders
- Validation against variable sources
- Hover to show variable value
- Track ConfigMap/Secret sources
- Auto-completion for known variables

### Reconciliation

#### Manual Reconciliation
- Right-click context menu action
- One-click reconcile trigger
- Reconcile with source option
- Force reconciliation

#### Reconciliation Timeline
- Visual timeline of sync operations
- Event history
- Error and warning aggregation
- Filter by resource type
- Search functionality

### Image Automation

#### ImageRepository Management
- View container registries
- Monitor image scanning
- See available tags
- Filter by policy

#### ImagePolicy Management
- View update policies
- See selected images
- Track automated updates
- Policy validation

#### Update Tracking
- See which resources use image automation
- Track update history
- View pending updates
- Rollback capabilities

### Flux CLI Integration

#### CLI Detection
- Auto-detect Flux CLI installation
- Version compatibility checking
- Installation guidance

#### CLI Commands
- `flux reconcile` - Trigger reconciliation
- `flux suspend` - Suspend resource
- `flux resume` - Resume resource
- `flux get` - Get resource status

## Configuration

### Settings

```json
{
  "extendedK8s.flux.enabled": true,
  "extendedK8s.flux.highlightVariables": true,
  "extendedK8s.flux.variableColor": "#3498db",
  "extendedK8s.flux.standardVariables": [
    "cluster_name",
    "cluster_region",
    "cluster_env",
    "namespace",
    "app_name"
  ]
}
```

### Variable Configuration

Define standard variables for auto-completion:
```json
{
  "extendedK8s.flux.standardVariables": [
    "cluster_name",
    "cluster_region",
    "environment",
    "tenant_id"
  ]
}
```

## Commands

- **Flux: Reconcile Resource** - Trigger reconciliation
- **Flux: Suspend Resource** - Suspend Flux resource
- **Flux: Resume Resource** - Resume suspended resource
- **Flux: Show Timeline** - Open reconciliation timeline
- **Flux: Validate Variables** - Check variable substitutions

## Integration with Kustomize

### Flux Kustomization Support
```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: apps
spec:
  interval: 10m
  path: ./apps/${cluster_env}  # ← Variable support
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
  postBuild:
    substitute:
      cluster_name: production
      cluster_region: us-east-1
```

### Features
- Navigate to path directories
- Validate sourceRef references
- Highlight variables in paths
- Validate postBuild substitutions

## Status: Planned

These features are planned for future implementation. Current status: **Not yet implemented**.

## Implementation Priority

1. **Phase 1**: Variable highlighting and validation
2. **Phase 2**: Resource tree view and status
3. **Phase 3**: Reconciliation triggers
4. **Phase 4**: Image automation
5. **Phase 5**: Timeline and advanced features
