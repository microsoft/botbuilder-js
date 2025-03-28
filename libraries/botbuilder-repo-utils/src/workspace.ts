// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fg from 'fast-glob';
import compact from 'lodash/compact';
import { minimatch } from 'minimatch';
import path from 'path';
import { Package } from './package';
import { readJsonFile } from './file';

export const glob = (paths: string[]): Promise<string[]> => fg(paths);

// Represents a workspace
export interface Workspace {
    absPath: string;
    relPath: string;
    pkg: Package;
}

// Represents options to filter workspaces
export interface Filters {
    ignoreName: string[];
    ignorePath: string[];
    name: string[];
    noPrivate: boolean;
    script: string;
    path: string[];
    hasLocalDependencies: boolean;
}

/**
 * Collect all concrete workspaces referenced in the root package.json file of a repo. Supports globs.
 *
 * @param {string} repoRoot absolute path to the root of the repo
 * @param {string[]} workspaces array of paths/globs to resolve
 * @param {Filters} filters set of filters to select or omit korkspaces
 * @returns {Promise<Array<Workspace>>} the resolved set of workspaces
 */
export async function collectWorkspacePackages(
    repoRoot: string,
    workspaces: string[] = [],
    filters: Partial<Filters> = {},
): Promise<Array<Workspace>> {
    // Note: posix is required, this emits absolute paths that are platform specific
    const paths = await glob(
        workspaces.map((workspace) => path.posix.join(repoRoot, workspace, 'package.json{,.js,.ts}')),
    );

    const maybeWorkspaces = await Promise.all(
        paths.map(async (absPath): Promise<Workspace | undefined> => {
            let relPath = absPath.replace(repoRoot, '');
            if (relPath[0] === path.sep) {
                relPath = relPath.slice(1);
            }

            // Strip `package.json` filename for path filters
            const relWorkspacePath = path.dirname(relPath);

            if (filters.path?.length && !filters.path.some((path) => minimatch(relWorkspacePath, path))) {
                return;
            }

            if (
                filters.ignorePath?.length &&
                filters.ignorePath.some((ignorePath) => minimatch(relWorkspacePath, ignorePath))
            ) {
                return;
            }

            const pkg = await readJsonFile<Package>(absPath);
            if (!pkg) {
                return undefined;
            }

            if (filters.noPrivate && pkg.private) {
                return;
            }

            if (filters.script && !(pkg.scripts ?? {})[filters.script]) {
                return;
            }

            if (filters.name?.length && !filters.name.some((name) => minimatch(pkg.name, name))) {
                return;
            }

            if (
                filters.ignoreName?.length &&
                filters.ignoreName.some((ignoreName) => minimatch(pkg.name, ignoreName))
            ) {
                return;
            }

            if (filters.hasLocalDependencies && Object.keys(pkg.localDependencies ?? {}).length === 0) {
                return;
            }

            return { absPath, pkg, relPath };
        }),
    );

    return compact(maybeWorkspaces);
}
