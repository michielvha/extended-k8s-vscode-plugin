import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { parseKustomizationFile } from '../utils/yamlParser';

/**
 * Tree view provider for Kustomize hierarchy
 * Shows bases, overlays, and resources in a tree structure
 */
export class KustomizeTreeProvider implements vscode.TreeDataProvider<KustomizeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<KustomizeItem | undefined | null | void> = new vscode.EventEmitter<KustomizeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<KustomizeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor() {
        // Watch for file changes
        const watcher = vscode.workspace.createFileSystemWatcher('**/kustomization.{yaml,yml}');
        watcher.onDidChange(() => this.refresh());
        watcher.onDidCreate(() => this.refresh());
        watcher.onDidDelete(() => this.refresh());
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: KustomizeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: KustomizeItem): Promise<KustomizeItem[]> {
        if (!element) {
            // Root level - find all kustomization files in workspace
            return this.findKustomizationRoots();
        }

        // Get children of a kustomization file
        return this.getKustomizationChildren(element);
    }

    private async findKustomizationRoots(): Promise<KustomizeItem[]> {
        const items: KustomizeItem[] = [];

        if (!vscode.workspace.workspaceFolders) {
            return items;
        }

        for (const folder of vscode.workspace.workspaceFolders) {
            const pattern = new vscode.RelativePattern(folder, '**/kustomization.{yaml,yml}');
            const files = await vscode.workspace.findFiles(pattern);

            for (const file of files) {
                const dirName = path.basename(path.dirname(file.fsPath));
                items.push(new KustomizeItem(
                    dirName,
                    file.fsPath,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'kustomization'
                ));
            }
        }

        return items;
    }

    private async getKustomizationChildren(element: KustomizeItem): Promise<KustomizeItem[]> {
        const items: KustomizeItem[] = [];

        try {
            const content = fs.readFileSync(element.filePath, 'utf8');
            const kustomization = parseKustomizationFile(content);
            const currentDir = path.dirname(element.filePath);

            // Add bases
            if (kustomization.bases && kustomization.bases.length > 0) {
                const basesItem = new KustomizeItem(
                    'Bases',
                    element.filePath,
                    vscode.TreeItemCollapsibleState.Expanded,
                    'folder'
                );
                items.push(basesItem);

                for (const base of kustomization.bases) {
                    const basePath = path.resolve(currentDir, base);
                    items.push(new KustomizeItem(
                        base,
                        basePath,
                        vscode.TreeItemCollapsibleState.None,
                        'base'
                    ));
                }
            }

            // Add components
            if (kustomization.components && kustomization.components.length > 0) {
                const componentsItem = new KustomizeItem(
                    'Components',
                    element.filePath,
                    vscode.TreeItemCollapsibleState.Expanded,
                    'folder'
                );
                items.push(componentsItem);

                for (const component of kustomization.components) {
                    const componentPath = path.resolve(currentDir, component);
                    items.push(new KustomizeItem(
                        component,
                        componentPath,
                        vscode.TreeItemCollapsibleState.None,
                        'component'
                    ));
                }
            }

            // Add resources
            if (kustomization.resources && kustomization.resources.length > 0) {
                const resourcesItem = new KustomizeItem(
                    `Resources (${kustomization.resources.length})`,
                    element.filePath,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'folder'
                );
                items.push(resourcesItem);

                for (const resource of kustomization.resources) {
                    const resourcePath = path.resolve(currentDir, resource);
                    items.push(new KustomizeItem(
                        path.basename(resource),
                        resourcePath,
                        vscode.TreeItemCollapsibleState.None,
                        'resource'
                    ));
                }
            }

        } catch (error) {
            console.error('Error parsing kustomization file:', error);
        }

        return items;
    }
}

class KustomizeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly filePath: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly itemType: 'kustomization' | 'base' | 'component' | 'resource' | 'folder'
    ) {
        super(label, collapsibleState);

        this.tooltip = filePath;
        this.contextValue = itemType;

        // Set icons based on type
        switch (itemType) {
            case 'kustomization':
                this.iconPath = new vscode.ThemeIcon('file-code');
                this.command = {
                    command: 'vscode.open',
                    title: 'Open File',
                    arguments: [vscode.Uri.file(filePath)]
                };
                break;
            case 'base':
                this.iconPath = new vscode.ThemeIcon('folder-library');
                break;
            case 'component':
                this.iconPath = new vscode.ThemeIcon('package');
                break;
            case 'resource':
                this.iconPath = new vscode.ThemeIcon('file');
                this.command = {
                    command: 'vscode.open',
                    title: 'Open File',
                    arguments: [vscode.Uri.file(filePath)]
                };
                break;
            case 'folder':
                this.iconPath = new vscode.ThemeIcon('folder');
                break;
        }
    }
}
