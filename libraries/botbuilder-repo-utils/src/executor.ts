// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as R from 'remeda';
import assert from 'assert';
import async from 'async';
import pmap from 'p-map';
import { Workspace } from './workspace';

// Describes a function signature for an executor that accepts a list of workspaces,
// a task, and a concurrency parameter and executes the task against all workspaces.
export type Executor = (
    workspaces: Workspace[],
    task: (workspace: Workspace) => Promise<boolean>,
    concurrency: number
) => Promise<boolean>;

// Executes `task` against `workspaces` ensuring that `task` is executed against dependencies
// before consumers (if possible, cycles are broken).
export const coordinatedExecutor: Executor = (workspaces, task, concurrency) => {
    const names = new Set(workspaces.map((workspace) => workspace.pkg.name));

    // Collect packages with all workspace deps
    const workspacesByPkgName: Record<string, { workspace: Workspace; dependencies: string[] }> = workspaces.reduce(
        (acc, workspace) => ({
            ...acc,
            [workspace.pkg.name]: {
                workspace,
                dependencies: R.uniq([
                    ...Object.keys(workspace.pkg.dependencies ?? {}).filter((name) => names.has(name)),
                    ...Object.keys(workspace.pkg.devDependencies ?? {}).filter((name) => names.has(name)),
                ]),
            },
        }),
        {}
    );

    // Construct a DAG of tasks, with cycles removed, for async execution
    const tasks = Object.entries(workspacesByPkgName).reduce((acc, [, { dependencies, workspace }]) => {
        return {
            ...acc,
            [workspace.pkg.name]: [
                ...R.reject(dependencies, (name) =>
                    // eslint-disable-next-line security/detect-object-injection
                    workspacesByPkgName[name].dependencies.includes(workspace.pkg.name)
                ),
                (...args: unknown[]) => {
                    const callback = args.pop();
                    assert(typeof callback === 'function');

                    task(workspace)
                        .then((success) => callback(null, success))
                        .catch((err) => callback(err));
                },
            ],
        };
    }, {});

    return new Promise((resolve, reject) =>
        async.auto(tasks, concurrency, (err, results) => {
            if (err) {
                return reject(err);
            }

            resolve(Object.values(results ?? {}).every((success) => success));
        })
    );
};

// Executes `task` against `workspaces` concurrently with no coordination
export const concurrentExecutor: Executor = async (workspaces, task, concurrency) => {
    const results = await pmap(workspaces, task, { concurrency });
    return results.every((success) => success);
};
