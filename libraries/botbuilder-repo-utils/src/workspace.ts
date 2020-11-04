// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as R from 'remeda';
import globby from 'globby';
import path from 'path';
import { Package } from './package';
import { readJsonFile } from './file';

export interface Workspace {
    absPath: string;
    pkg: Package;
}

// Returns all workspace packages by resolving the `workspaces` key inside package.json
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
