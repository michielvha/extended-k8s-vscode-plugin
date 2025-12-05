import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { parseKustomizationFile } from '../utils/yamlParser';

/**
 * Provides go-to-definition functionality for Kustomize files
 * Handles navigation for resources, bases, components, patches, etc.
 */
export class KustomizeNavigationProvider implements vscode.DefinitionProvider {

    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Definition | undefined> {

        const line = document.lineAt(position);
        const lineText = line.text;

        // Check if we're on a line that could contain a file/directory reference
        if (!this.isNavigableLine(lineText)) {
            return undefined;
        }

        // Extract the path from the current line
        const filePath = this.extractPath(lineText);
        if (!filePath) {
            return undefined;
        }

        // Resolve the path relative to the current kustomization.yaml
        const currentDir = path.dirname(document.uri.fsPath);
        const targetPath = path.resolve(currentDir, filePath);

        // Check if it's a directory (for bases/components)
        if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
            // Look for kustomization.yaml or kustomization.yml in the directory
            const kustomizationPath = this.findKustomizationFile(targetPath);
            if (kustomizationPath) {
                return new vscode.Location(
                    vscode.Uri.file(kustomizationPath),
                    new vscode.Position(0, 0)
                );
            }
        }

        // Check if it's a file
        if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
            return new vscode.Location(
                vscode.Uri.file(targetPath),
                new vscode.Position(0, 0)
            );
        }

        return undefined;
    }

    private isNavigableLine(line: string): boolean {
        const navigableFields = [
            'resources:',
            'bases:',
            'components:',
            'patches:',
            'patchesStrategicMerge:',
            'patchesJson6902:',
            'configMapGenerator:',
            'secretGenerator:',
            '- path:',
            '- '
        ];

        return navigableFields.some(field => line.includes(field));
    }

    private extractPath(line: string): string | undefined {
        // Match YAML list item or path value
        // Improved to handle files with dots, dashes, and slashes
        // Examples:
        //   - ../base
        //   - s3-bucket-xrd.yaml
        //   - path: patches/my-patch.yaml
        //   path: config.yaml

        const patterns = [
            /- ([a-zA-Z0-9_.\-\/]+(?:\.ya?ml)?)/,  // List item with file extensions
            /path:\s*([a-zA-Z0-9_.\-\/]+)/,        // path: value
            /:\s*([a-zA-Z0-9_.\-\/]+(?:\.ya?ml)?)/ // Generic key: value
        ];

        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match && match[1]) {
                return match[1].trim().replace(/['"]/g, '');
            }
        }

        return undefined;
    }

    private findKustomizationFile(directory: string): string | undefined {
        const possibleNames = ['kustomization.yaml', 'kustomization.yml', 'Kustomization'];

        for (const name of possibleNames) {
            const fullPath = path.join(directory, name);
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }

        return undefined;
    }
}
