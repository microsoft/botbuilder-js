// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import getStream from 'get-stream';
import { spawn } from 'child_process';

export type Result = {
    code: number;
    stdout?: string;
    stderr?: string;
};

/**
 * Executes a command returning stdout/stderr.
 *
 * @param {string} bin name of a binary to execute
 * @param {string[]} args set of args to pass to binary
 * @param {string} cwd working dir for command
 * @param {boolean} silent suppress output
 * @returns {Promise<Result>} exit code of command and stderr output (if any)
 */
export async function execute(bin: string, args: string[], cwd: string, silent = false): Promise<Result> {
    const cmd = spawn(bin, args, { cwd, shell: true });

    const stdout = silent ? getStream(cmd.stdout) : Promise.resolve(undefined);
    const stderr = silent ? getStream(cmd.stderr) : Promise.resolve(undefined);

    if (!silent) {
        cmd.stdout.pipe(process.stdout);
        cmd.stderr.pipe(process.stderr);
    }

    const code = await new Promise<number>((resolve, reject) => {
        cmd.once('close', resolve);
        cmd.once('error', reject);
    });

    return {
        code,
        stdout: code !== 0 ? await stdout : undefined,
        stderr: code !== 0 ? await stderr : undefined,
    };
}
