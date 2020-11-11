// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import getStream from 'get-stream';
import { spawn } from 'child_process';

// Options for executing a command
export interface Options {
    // Path to use for current working directory when executing a command
    cwd?: string;
    // Stream output to stdout/stderr rather than buffering
    stream?: boolean;
    // Suppress stdout output
    silent?: boolean;
    // Execute command in context of a shell
    shell?: boolean;
}

// Result of executing a command
export interface Result {
    stdout?: string;
    stderr?: string;
}

/**
 * Executes a command returning stdout/stderr.
 *
 * @param {string} bin name of a binary to execute
 * @param {string[]} args set of args to pass to binary
 * @param {Options} options options for execution
 * @returns {Promise<Result>} execution results
 */
export async function execute(bin: string, args: string[], options: Options): Promise<Result> {
    const cmd = spawn(bin, args, options);

    let stdoutPromise = Promise.resolve<string | undefined>(undefined);
    let stderrPromise = Promise.resolve<string | undefined>(undefined);

    if (options.stream) {
        if (!options.silent) {
            cmd.stdout.on('data', (data) => console.log(data.toString('utf8').trim()));
        }

        cmd.stderr.on('data', (data) => console.error(data.toString('utf8').trim()));
    } else {
        if (!options.silent) {
            stdoutPromise = getStream(cmd.stdout, { maxBuffer: Infinity });
        }

        stderrPromise = getStream(cmd.stderr, { maxBuffer: Infinity });
    }

    await new Promise((resolve, reject) => {
        cmd.on('close', resolve);
        cmd.on('error', reject);
    });

    const [stdout, stderr] = await Promise.all([stdoutPromise, stderrPromise]);
    return { stdout: stdout?.trim(), stderr: stderr?.trim() };
}
