// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as R from 'remeda';
import assert from 'assert';
import async from 'async';
import minimist from 'minimist';
import path from 'path';
import pmap from 'p-map';
import { Package } from './package';
import { Result, failure, run, success } from './run';
import { Workspace, collectWorkspacePackages } from './workspace';
import { execute } from './process';
import { gitRoot } from './git';
import { readJsonFile } from './file';

// Describes a function signature for an executor that accepts a list of workspaces,
// a task, and a concurrency parameter and executes the task against all workspaces.
type Executor = (
    workspaces: Workspace[],
    task: (workspace: Workspace) => Promise<unknown>,
    concurrency?: number
) => Promise<unknown>;

// Executes `task` against `workspaces` ensuring that `task` is executed against dependencies
// before consumers (if possible, cycles are broken).
const coordinatedExecutor: Executor = (workspaces, task, concurrency) => {
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
                        .then(() => callback())
                        .catch((err) => callback(err));
                },
            ],
        };
    }, {});

    return new Promise((resolve, reject) => async.auto(tasks, concurrency, (err) => (err ? reject(err) : resolve())));
};

// Executes `task` against `workspaces` concurrently with no coordination
const concurrentExecutor: Executor = (workspaces, task, concurrency) => pmap(workspaces, task, { concurrency });

export const command = (argv: string[], quiet = false) => async (): Promise<Result> => {
    const { _: maybeCmd, ...flags } = minimist(argv, {
        '--': true,
        boolean: ['continue', 'coordinated', 'noPrivate', 'silent', 'stream'],
        default: { concurrency: '5', npm: 'yarn' },
        string: ['concurrency', 'ignoreName', 'ignorePath', 'name', 'npm', 'path', 'script', 'scriptArgs'],
    });

    // `--scriptArgs` can be passed zero, one, or many times which each result in a different
    // type of value. Resolve them all into an array of strings.
    const maybeScriptArgs: string[] = Array.isArray(flags.scriptArgs)
        ? flags.scriptArgs
        : flags.scriptArgs?.split(' ') ?? [];

    // Resolve npm args from the command, `npm` requires the extra 'run' arg
    const npmArgs = flags.npm.trim() === 'npm' ? ['npm', 'run'] : [flags.npm.trim()];

    // To pass flags to the resolved command use '--' in the command line invocation
    const maybeFlags: string[] = flags['--'] ?? [];

    // If we just have --script, simply invoke that with the npm program. Support passing scriptArgs directly
    // as flags propagation isn't reliable in package.json scripts that call other scripts.
    const command = R.compact(
        flags.script ? [...npmArgs, flags.script, ...maybeFlags, ...maybeScriptArgs] : [...maybeCmd, ...maybeFlags]
    );

    if (!command.length) {
        throw new Error('must provide a command to execute');
    }

    let concurrency: number | undefined;
    if (flags.concurrency) {
        concurrency = parseInt(flags.concurrency, 10);
        if (!concurrency || concurrency < 1) {
            return failure('concurrency must be a positive number', 20);
        }
    }

    const repoRoot = await gitRoot();

    const packageFile = await readJsonFile<Package>(path.join(repoRoot, 'package.json'));
    if (!packageFile) {
        return failure('package.json not found', 21);
    }

    const workspaces = await collectWorkspacePackages(repoRoot, packageFile.workspaces, {
        ignoreName: flags.ignoreName,
        ignorePath: flags.ignorePath,
        name: flags.name,
        noPrivate: flags.noPrivate,
        script: flags.script,
        path: flags.path,
    });

    if (!workspaces.length) {
        return failure('no workspaces matched', 22);
    }

    const task = async (workspace: Workspace) => {
        const fmt = (message: string) => `[${workspace.pkg.name}]: ${message.trim()}`;

        const log = (message: string) => !quiet && console.log(fmt(message));

        const error = (message: string) => {
            if (flags.continue) {
                if (!quiet) {
                    console.error(fmt(message));
                }
            } else {
                throw new Error(fmt(message));
            }
        };

        try {
            log(command.join(' '));

            const [bin, ...args] = command;

            const { stdout, stderr } = await execute(bin, args, {
                cwd: path.dirname(workspace.absPath),
                shell: true,
                silent: flags.silent,
                stream: flags.stream,
            });

            if (stderr) {
                error(stderr);
            } else {
                log(stdout || 'done!');
            }
        } catch (err) {
            error(err.message);
        }
    };

    let coordinator: Executor = concurrentExecutor;
    if (flags.coordinated) {
        coordinator = coordinatedExecutor;
    }

    try {
        await coordinator(workspaces, task, concurrency);

        return success();
    } catch (err) {
        return failure(err.message);
    }
};

if (require.main === module) {
    run(command(process.argv.slice(2)));
}
