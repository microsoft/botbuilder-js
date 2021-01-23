// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as R from 'remeda';
import log from 'npmlog';
import minimist from 'minimist';
import path from 'path';
import { Package } from './package';
import { Result, failure, run, success } from './run';
import { Workspace, collectWorkspacePackages } from './workspace';
import { coordinatedExecutor, concurrentExecutor } from './executor';
import { execute } from './process';
import { gitRoot } from './git';
import { readJsonFile } from './file';

/**
 * Execute a command across workspaces.
 *
 * @param {string[]} argv args to parse
 * @param {log.Logger | null} logger logger to use, or null to disable
 * @returns {Promise<Result>} a promise that resolves to the result of execution
 */
export const command = (argv: string[], logger: log.Logger | null = log) => async (): Promise<Result> => {
    const { _: maybeCmd, ...flags } = minimist(argv, {
        '--': true,
        boolean: ['bail', 'coordinated', 'noPrivate', 'parallel'],
        default: { bail: false, coordinated: false, npm: 'yarn', parallel: false },
        string: ['ignoreName', 'ignorePath', 'name', 'npm', 'path', 'script', 'scriptArgs'],
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

    const concurrency = flags.parallel ? 5 : 1;

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

    const task = async ({ absPath, pkg: { name } }: Workspace): Promise<boolean> => {
        logger?.info(name, command.join(' '));

        const [bin, ...args] = command;
        const { code, stdout, stderr } = await execute(bin, args, path.dirname(absPath), flags.parallel);

        if (code !== 0) {
            logger?.error(name, `failed with exit code ${code}`);

            if (stdout?.trim()) {
                logger?.error(name, stdout.trim());
            }

            if (stderr?.trim()) {
                logger?.error(name, stderr.trim());
            }

            if (flags.bail) {
                throw new Error();
            } else {
                return false;
            }
        }

        return true;
    };

    const executor = flags.coordinated ? coordinatedExecutor : concurrentExecutor;

    try {
        if (await executor(workspaces, task, concurrency)) {
            return success();
        } else {
            return failure('One or more tasks failed!');
        }
    } catch (err) {
        return failure(err.message);
    }
};

if (require.main === module) {
    run(command(process.argv.slice(2)));
}
