# Feature Documentation Index

This directory contains detailed documentation for all features of the Extended Kubernetes VS Code Extension.

## Available Documentation

### [Kustomize Features](./kustomize.md) ✅ **Implemented**
- Smart navigation (Ctrl+Click)
- Real-time diagnostics
- Tree view hierarchy
- Support for:
  - Resources, bases, components, patches
  - helmGlobals.chartHome
  - configMapGenerator/secretGenerator files
  - Deprecated fields (patchesStrategicMerge, patchesJson6902)

### [ArgoCD Features](./argocd.md) 📋 **Planned**
- Multi-instance server support
- Application management and sync
- Template library
- YAML CodeLens integration
- Deployment history and rollback

### [FluxCD Features](./fluxcd.md) 📋 **Planned**
- Resource tree view (GitRepositories, HelmReleases, Kustomizations)
- Variable substitution highlighting
- Reconciliation triggers and timeline
- Image automation management

### [Advanced Kubernetes Features](./kubernetes-advanced.md) 📋 **Planned**
- CRD schema validation
- Deep autocompletion
- Resource diagrams
- Advanced log streaming
- Context/namespace switching

## Status Legend

- ✅ **Implemented** - Feature is working and available
- 🚧 **In Progress** - Currently being developed
- 📋 **Planned** - Designed but not yet implemented
- 💡 **Proposed** - Under consideration

## Quick Links

- [Main README](../../README.md)
- [Design Plan](../kustomize_extension_design.md)
- [Walkthrough](../walkthrough.md)
- [Original Inspiration](https://github.com/moon-hex/kustomize-navigator) - Very nice starting point for the kustomize features