// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import minimist from 'minimist';
import path from 'path';
import util from 'util';
import { Package } from './package';
import { DependencyResolver, collectWorkspacePackages } from './workspace';
import { exec } from 'child_process';
import { failure, run, success } from './run';
import { gitRoot } from './git';
import { readJsonFile } from './file';

const execp = util.promisify(exec);

run(async () => {
    const { _: maybeCmd, ...flags } = minimist(process.argv.slice(2), {
        boolean: ['continue', 'noPrivate', 'silent'],
        default: { concurrency: '', npm: 'yarn' },
        string: ['concurrency', 'ignoreName', 'ignorePath', 'name', 'npm', 'script', 'path'],
    });

    // Resolve npm args from the command, `npm` requires the extra 'run' arg
    const npmArgs = flags.npm.trim() === 'npm' ? ['npm', 'run'] : [flags.npm.trim()];

    // If we just have --script, simply invoke that with the npm program
    const cmd = flags.script ? [...npmArgs, flags.script] : maybeCmd;

    if (!cmd.length) {
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
            console.log(`[${workspace.pkg.name}]: ${cmd.join(' ')}`);

            const { stdout, stderr } = await execp(cmd.join(' '), {
                cwd: path.dirname(workspace.absPath),
            });

            if (stderr) {
                if (flags.continue) {
                    console.error(`[${workspace.pkg.name}]: ${stderr.trim()}`);
                } else {
                    throw new Error(`[${workspace.pkg.name}]: ${stderr.trim()}`);
                }
            } else if (!flags.silent) {
                console.log(`[${workspace.pkg.name}]: ${stdout.trim()}`);
            }
        });

        return success();
    } catch (err) {
        return failure(err.message);
    }
});
