import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Provides clickable links for Kustomize file references
 * This gives us full control over what text is highlighted
 */
export class KustomizeLinkProvider implements vscode.DocumentLinkProvider {

    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.DocumentLink[] {
        const links: vscode.DocumentLink[] = [];

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const lineText = line.text;

            // Skip if not a navigable line
            if (!this.isNavigableLine(lineText)) {
                continue;
            }

            // Find the path in the line
            const pathMatch = this.findPathInLine(lineText);
            if (!pathMatch) {
                continue;
            }

            const { path: filePath, startIndex, endIndex } = pathMatch;

            // Resolve the target path
            const currentDir = path.dirname(document.uri.fsPath);
            const targetPath = path.resolve(currentDir, filePath);

            if (!fs.existsSync(targetPath)) {
                continue;
            }

            // Determine the target URI
            let targetUri: vscode.Uri;

            if (fs.statSync(targetPath).isDirectory()) {
                const kustomizationPath = this.findKustomizationFile(targetPath);
                if (!kustomizationPath) {
                    continue;
                }
                targetUri = vscode.Uri.file(kustomizationPath);
            } else {
                targetUri = vscode.Uri.file(targetPath);
            }

            // Create the document link with exact range
            const range = new vscode.Range(
                new vscode.Position(i, startIndex),
                new vscode.Position(i, endIndex)
            );

            const link = new vscode.DocumentLink(range, targetUri);
            link.tooltip = `Go to ${filePath}`;
            links.push(link);
        }

        return links;
    }

    private isNavigableLine(line: string): boolean {
        // Skip lines with HTTP/HTTPS URLs - these are not file paths
        if (line.includes('http://') || line.includes('https://')) {
            return false;
        }

        const navigableFields = [
            'resources:',
            'bases:',
            'components:',
            'patches:',
            'patchesStrategicMerge:',
            'patchesJson6902:',
            'chartHome:',           // helmGlobals support
            'configMapGenerator:',
            'secretGenerator:',
            'files:',               // for generators
            'path:',                // for patches and other path references
            '- '                    // list items
        ];

        return navigableFields.some(field => line.includes(field));
    }

    private findPathInLine(line: string): { path: string; startIndex: number; endIndex: number } | undefined {
        // Patterns to match file paths with their positions
        // Updated to handle ../, multiple dots, flexible spacing, and indentation
        const patterns = [
            // List item with path (handles ../../base, ../file.yaml, file.yaml)
            // Matches: "  - ../base" or "- file.yaml"
            {
                regex: /-\s+([\.\/a-zA-Z0-9_\-]+(?:\.ya?ml)?)/,
                getName: (match: RegExpExecArray) => match[1]
            },
            // path: value (in patches, generators, etc.) - handles indentation and flexible spacing
            // Matches: "  - path: patches.yaml" or "    path: file.yaml"
            {
                regex: /path:\s*([\.\/a-zA-Z0-9_\-]+(?:\.ya?ml)?)/,
                getName: (match: RegExpExecArray) => match[1]
            },
            // chartHome: value - flexible spacing with \s*
            // Matches: "  chartHome: helm" or "chartHome: ./charts"
            {
                regex: /chartHome:\s*([\.\/a-zA-Z0-9_\-]+)/,
                getName: (match: RegExpExecArray) => match[1]
            },
        ];

        for (const pattern of patterns) {
            const match = pattern.regex.exec(line);
            if (match && match[1]) {
                const filePath = match[1].trim().replace(/['"]/g, '');
                // Find the actual start position of the captured group
                const startIndex = line.indexOf(match[1], match.index);
                const endIndex = startIndex + match[1].length;

                return { path: filePath, startIndex, endIndex };
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
