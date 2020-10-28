// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import globby from 'globby';
import path from 'path';
import { Package } from './package';
import { readJsonFile } from './file';

export interface Workspace {
    absolutePath: string;
    contents: Package | null;
}

export async function collectWorkspacePackages(repoRoot: string, workspaces: string[]): Promise<Array<Workspace>> {
    const paths = await globby(workspaces.map((workspace) => path.join(repoRoot, workspace, 'package.json')));
    return Promise.all(
        paths.map(async (absolutePath) => ({ absolutePath, contents: await readJsonFile<Package>(absolutePath) }))
    );
}
