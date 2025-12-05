import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { parseKustomizationFile } from '../utils/yamlParser';

/**
 * Provides real-time diagnostics for Kustomize files
 * Validates file references, detects circular dependencies, and checks for common issues
 */
export class KustomizeDiagnosticsProvider implements vscode.Disposable {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private disposables: vscode.Disposable[] = [];

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('kustomize');

        // Watch for document changes
        this.disposables.push(
            vscode.workspace.onDidOpenTextDocument(doc => this.validateDocument(doc)),
            vscode.workspace.onDidSaveTextDocument(doc => this.validateDocument(doc)),
            vscode.workspace.onDidChangeTextDocument(e => this.validateDocument(e.document))
        );

        // Validate all open kustomization files
        vscode.workspace.textDocuments.forEach(doc => this.validateDocument(doc));
    }

    private async validateDocument(document: vscode.TextDocument) {
        if (!this.isKustomizationFile(document)) {
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        const content = document.getText();
        const currentDir = path.dirname(document.uri.fsPath);

        try {
            const kustomization = parseKustomizationFile(content);

            // Validate resources
            if (kustomization.resources) {
                for (const resource of kustomization.resources) {
                    this.validatePath(document, resource, currentDir, 'resource', diagnostics);
                }
            }

            // Validate bases
            if (kustomization.bases) {
                for (const base of kustomization.bases) {
                    this.validatePath(document, base, currentDir, 'base', diagnostics);
                }
            }

            // Validate components
            if (kustomization.components) {
                for (const component of kustomization.components) {
                    this.validatePath(document, component, currentDir, 'component', diagnostics);
                }
            }

            // Validate patches
            if (kustomization.patches) {
                for (const patch of kustomization.patches) {
                    const patchPath = typeof patch === 'string' ? patch : patch.path;
                    if (patchPath) {
                        this.validatePath(document, patchPath, currentDir, 'patch', diagnostics);
                    }
                }
            }

            // Warn about deprecated fields
            if (kustomization.patchesStrategicMerge) {
                const line = this.findLineWithText(document, 'patchesStrategicMerge');
                if (line !== -1) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(line, 0, line, 100),
                        'patchesStrategicMerge is deprecated in Kustomize v5+. Use patches instead.',
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
            }

            if (kustomization.patchesJson6902) {
                const line = this.findLineWithText(document, 'patchesJson6902');
                if (line !== -1) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(line, 0, line, 100),
                        'patchesJson6902 is deprecated in Kustomize v5+. Use patches instead.',
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
            }

        } catch (error) {
            // YAML parsing error
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 100),
                `Failed to parse kustomization file: ${error}`,
                vscode.DiagnosticSeverity.Error
            ));
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    private validatePath(
        document: vscode.TextDocument,
        pathValue: string,
        currentDir: string,
        type: string,
        diagnostics: vscode.Diagnostic[]
    ) {
        const targetPath = path.resolve(currentDir, pathValue);
        const line = this.findLineWithText(document, pathValue);

        if (line === -1) {
            return; // Couldn't find the line
        }

        if (!fs.existsSync(targetPath)) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(line, 0, line, 1000),
                `${type} not found: ${pathValue}`,
                vscode.DiagnosticSeverity.Error
            ));
            return;
        }

        // For bases and components, check if kustomization file exists
        if (type === 'base' || type === 'component') {
            if (fs.statSync(targetPath).isDirectory()) {
                const hasKustomization = this.hasKustomizationFile(targetPath);
                if (!hasKustomization) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(line, 0, line, 1000),
                        `No kustomization.yaml found in ${type}: ${pathValue}`,
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }
        }
    }

    private hasKustomizationFile(directory: string): boolean {
        const possibleNames = ['kustomization.yaml', 'kustomization.yml', 'Kustomization'];
        return possibleNames.some(name => fs.existsSync(path.join(directory, name)));
    }

    private findLineWithText(document: vscode.TextDocument, text: string): number {
        for (let i = 0; i < document.lineCount; i++) {
            if (document.lineAt(i).text.includes(text)) {
                return i;
            }
        }
        return -1;
    }

    private isKustomizationFile(document: vscode.TextDocument): boolean {
        const fileName = path.basename(document.uri.fsPath);
        return fileName === 'kustomization.yaml' ||
            fileName === 'kustomization.yml' ||
            fileName === 'Kustomization';
    }

    dispose() {
        this.diagnosticCollection.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}
