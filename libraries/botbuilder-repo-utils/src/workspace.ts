// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as R from 'remeda';
import globby from 'globby';
import path from 'path';
import { Package } from './package';
import { readJsonFile } from './file';

// Represents a workspace
export interface Workspace {
    absPath: string;
    pkg: Package;
}

/**
 * Collect all concrete workspaces referenced in the root package.json file of a repo. Supports globs.
 *
 * @param {string} repoRoot absolute path to the root of the repo
 * @param {string[]} workspaces array of paths/globs to resolve
 * @returns {Promise<Array<Workspace>>} the resolved set of workspaces
 */
export async function collectWorkspacePackages(repoRoot: string, workspaces: string[]): Promise<Array<Workspace>> {
    const paths = await globby(workspaces.map((workspace) => path.join(repoRoot, workspace, 'package.json')));

    const maybeWorkspaces = await Promise.all(
        paths.map(
            async (absPath): Promise<Workspace | undefined> => {
                const pkg = await readJsonFile<Package>(absPath);
                if (!pkg) {
                    return undefined;
                }

                return { absPath, pkg };
            }
        )
    );

    return R.compact(maybeWorkspaces);
}
