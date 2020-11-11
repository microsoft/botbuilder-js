// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as R from 'remeda';
import globby from 'globby';
import minimatch from 'minimatch';
import path from 'path';
import pmap from 'p-map';
import { Package } from './package';
import { readJsonFile } from './file';

export interface Workspace {
    absPath: string;
    relPath: string;
    pkg: Package;
}

export interface Filters {
    ignoreName: string;
    ignorePath: string;
    name: string;
    noPrivate: boolean;
    script: string;
    path: string;
}

// Returns all workspace packages by resolving the `workspaces` key inside package.json
export async function collectWorkspacePackages(
    repoRoot: string,
    workspaces: string[] = [],
    filters: Partial<Filters> = {}
): Promise<Array<Workspace>> {
    // Note: posix is required by globby, this emits absolute paths that are platform specific
    const paths = await globby(workspaces.map((workspace) => path.posix.join(repoRoot, workspace, 'package.json')));

    const maybeWorkspaces = await Promise.all(
        paths.map(
            async (absPath): Promise<Workspace | undefined> => {
                let relPath = absPath.replace(repoRoot, '');
                if (relPath[0] === path.sep) {
                    relPath = relPath.slice(1);
                }

                if (filters.path && !minimatch(relPath, filters.path)) {
                    return;
                }

                if (filters.ignorePath && minimatch(relPath, filters.ignorePath)) {
                    return;
                }

                const pkg = await readJsonFile<Package>(absPath);
                if (!pkg) {
                    return undefined;
                }

                if (filters.noPrivate && pkg.private) {
                    return;
                }

                if (filters.script && !pkg.scripts[filters.script]) {
                    return;
                }

                if (filters.name && !minimatch(pkg.name, filters.name)) {
                    return;
                }

                if (filters.ignoreName && minimatch(pkg.name, filters.ignoreName)) {
                    return;
                }

                return { absPath, pkg, relPath };
            }
        )
    );

    return R.compact(maybeWorkspaces);
}

// Takes a set of workspaces and exposes an execute method that invokes a callback
// concurrently on each workspace, ensuring that dependencies are processed before
// their consumers.
export class DependencyResolver {
    private readonly byName: Record<string, Workspace>;
    private readonly depsByName: Record<string, Workspace[]>;

    constructor(private readonly workspaces: Workspace[], private readonly concurrency = Infinity) {
        this.byName = this.workspaces.reduce<Record<string, Workspace>>(
            (acc, workspace) => ({ ...acc, [workspace.pkg.name]: workspace }),
            {}
        );

        this.depsByName = this.workspaces.reduce<Record<string, Workspace[]>>((acc, workspace) => {
            const deps = [
                ...Object.keys(workspace.pkg.dependencies ?? {}),
                ...Object.keys(workspace.pkg.devDependencies ?? {}),
            ]
                .map((name) => this.byName[name])
                .filter((pkg) => !!pkg);

            return { ...acc, [workspace.pkg.name]: deps };
        }, {});
    }

    async execute(callback: (workspace: Workspace, group: number) => Promise<unknown>): Promise<void> {
        const resolved = new Set<string>();

        // Returns list of packages where all dependencies are resolved
        const ready = () =>
            R.flatten(
                Object.entries(this.byName)
                    .filter(([name]) => {
                        const deps = this.depsByName[name];

                        const needs = deps.filter((dep) => !resolved.has(dep.pkg.name));

                        // Only report a cycle if both packages are just waiting for each other
                        const cycle =
                            needs.length === 1 &&
                            needs.every((other) => {
                                const needs = this.depsByName[other.pkg.name].filter(
                                    (other) => !resolved.has(other.pkg.name)
                                );
                                return needs.length === 1 && needs.every((other) => other.pkg.name === name);
                            });

                        return (!needs.length || cycle) && !resolved.has(name);
                    })
                    .map(([, pkg]) => pkg)
            );

        let group = 0;
        let packages = ready();
        while (packages.length) {
            await pmap(
                packages,
                async (workspace) => {
                    await callback(workspace, group);
                    resolved.add(workspace.pkg.name);
                },
                { concurrency: this.concurrency }
            );

            packages = ready();
            group++;
        }
    }
}
