// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as R from 'remeda';
import minimist from 'minimist';
import path from 'path';
import { DependencyResolver, collectWorkspacePackages } from './workspace';
import { Package } from './package';
import { Result, failure, run, success } from './run';
import { execute } from './process';
import { gitRoot } from './git';
import { readJsonFile } from './file';

export const command = (argv: string[], quiet = false) => async (): Promise<Result> => {
    const { _: maybeCmd, ...flags } = minimist(argv, {
        '--': true,
        boolean: ['continue', 'noPrivate', 'silent', 'stream'],
        default: { concurrency: '', npm: 'yarn' },
        string: ['concurrency', 'ignoreName', 'ignorePath', 'name', 'npm', 'path', 'script', 'scriptArgs'],
    });

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

    const dependencyResolver = new DependencyResolver(workspaces, concurrency);

    try {
        await dependencyResolver.execute(async (workspace) => {
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
        });

        return success();
    } catch (err) {
        return failure(err.message);
    }
};

if (require.main === module) {
    run(command(process.argv.slice(2)));
}
