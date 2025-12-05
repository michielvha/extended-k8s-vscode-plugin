import * as yaml from 'yaml';

export interface KustomizationFile {
    apiVersion?: string;
    kind?: string;
    resources?: string[];
    bases?: string[];
    components?: string[];
    patches?: (string | { path: string; target?: any })[];
    patchesStrategicMerge?: string[];
    patchesJson6902?: any[];
    configMapGenerator?: any[];
    secretGenerator?: any[];
    namespace?: string;
    namePrefix?: string;
    nameSuffix?: string;
    commonLabels?: Record<string, string>;
    commonAnnotations?: Record<string, string>;
}

/**
 * Parse a kustomization.yaml file
 */
export function parseKustomizationFile(content: string): KustomizationFile {
    try {
        const parsed = yaml.parse(content);
        return parsed as KustomizationFile;
    } catch (error) {
        throw new Error(`Failed to parse YAML: ${error}`);
    }
}

/**
 * Detect the type of Kubernetes/Kustomize document
 */
export function detectDocumentType(content: string): 'kubernetes' | 'kustomize' | 'argocd' | 'flux' | 'unknown' {
    try {
        const parsed = yaml.parse(content);

        if (!parsed || typeof parsed !== 'object') {
            return 'unknown';
        }

        const apiVersion = parsed.apiVersion as string;
        const kind = parsed.kind as string;

        // Kustomize
        if (kind === 'Kustomization' || apiVersion?.includes('kustomize')) {
            return 'kustomize';
        }

        // ArgoCD
        if (apiVersion?.includes('argoproj.io')) {
            return 'argocd';
        }

        // Flux
        if (apiVersion?.includes('kustomize.toolkit.fluxcd.io') ||
            apiVersion?.includes('source.toolkit.fluxcd.io') ||
            apiVersion?.includes('helm.toolkit.fluxcd.io')) {
            return 'flux';
        }

        // Generic Kubernetes
        if (apiVersion && kind) {
            return 'kubernetes';
        }

        return 'unknown';
    } catch (error) {
        return 'unknown';
    }
}

/**
 * Extract Flux variables from content
 */
export function extractFluxVariables(content: string): string[] {
    const variablePattern = /\$\{([^}]+)\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variablePattern.exec(content)) !== null) {
        variables.push(match[1]);
    }

    return [...new Set(variables)]; // Remove duplicates
}
