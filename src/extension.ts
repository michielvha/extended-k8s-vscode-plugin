import * as vscode from 'vscode';
import { KustomizeNavigationProvider } from './kustomize/navigationProvider';
import { KustomizeLinkProvider } from './kustomize/linkProvider';
import { KustomizeDiagnosticsProvider } from './kustomize/diagnosticsProvider';
import { KustomizeTreeProvider } from './kustomize/treeProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extended Kubernetes Tools extension is now active');

    const config = vscode.workspace.getConfiguration('extendedK8s');

    // Kustomize Features
    if (config.get('kustomize.enabled')) {
        // Document Link Provider (for proper highlighting)
        const linkProvider = new KustomizeLinkProvider();
        context.subscriptions.push(
            vscode.languages.registerDocumentLinkProvider(
                { language: 'yaml', pattern: '**/kustomization.{yaml,yml}' },
                linkProvider
            )
        );

        // Navigation Provider (Ctrl+Click) - kept as fallback
        const navigationProvider = new KustomizeNavigationProvider();
        context.subscriptions.push(
            vscode.languages.registerDefinitionProvider(
                { language: 'yaml', pattern: '**/kustomization.{yaml,yml}' },
                navigationProvider
            )
        );

        // Diagnostics Provider
        const diagnosticsProvider = new KustomizeDiagnosticsProvider();
        context.subscriptions.push(diagnosticsProvider);

        // Tree View Provider
        const treeProvider = new KustomizeTreeProvider();
        context.subscriptions.push(
            vscode.window.registerTreeDataProvider('extendedK8s.kustomizeExplorer', treeProvider)
        );

        // Commands
        context.subscriptions.push(
            vscode.commands.registerCommand('extendedK8s.kustomize.preview', async () => {
                vscode.window.showInformationMessage('Kustomize preview coming soon!');
            })
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('extendedK8s.kustomize.build', async () => {
                const terminal = vscode.window.createTerminal('Kustomize Build');
                terminal.show();
                terminal.sendText('kustomize build .');
            })
        );
    }

    // Flux CD Features
    if (config.get('flux.enabled')) {
        context.subscriptions.push(
            vscode.commands.registerCommand('extendedK8s.flux.reconcile', async () => {
                vscode.window.showInformationMessage('Flux reconcile coming soon!');
            })
        );
    }

    // ArgoCD Features
    if (config.get('argocd.enabled')) {
        context.subscriptions.push(
            vscode.commands.registerCommand('extendedK8s.argocd.sync', async () => {
                vscode.window.showInformationMessage('ArgoCD sync coming soon!');
            })
        );
    }
}

export function deactivate() {
    console.log('Extended Kubernetes Tools extension is now deactivated');
}
