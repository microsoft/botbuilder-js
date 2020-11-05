// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { exec, spawn } from 'child_process';
import util from 'util';

const execp = util.promisify(exec);

// Options for executing a command
export interface ExecuteOptions {
    // Path to use for current working directory when executing a command
    cwd: string;
}

// Result of executing a command
export interface ExecuteResult {
    stdout: string;
    stderr: string;
}

/**
 * Executes a command returning stdout/stderr.
 *
 * @param {string} bin name of a binary to execute
 * @param {string[]} args set of args to pass to binary
 * @param {ExecuteOptions} options options for execution
 * @returns {Promise<ExecuteResult>} execution results
 */
export async function execute(bin: string, args: string[], options: ExecuteOptions): Promise<ExecuteResult> {
    const { stdout, stderr } = await execp([bin, ...args].join(' '), options);
    return { stdout: stdout.trim(), stderr: stderr.trim() };
}

/**
 * Executes a command and streams output to stdout/stderr.
 *
 * @param {string} bin name of a binary to execute
 * @param {string[]} args set of args to pass to binary
 * @param {ExecuteOptions} options options for execution
 * @returns {Promise<void>} promise that resolves when execution is complete
 */
export async function stream(bin: string, args: string[], options: ExecuteOptions): Promise<void> {
    const cmd = spawn(bin, args, options);

    cmd.stdout.on('data', (buf) => console.log(buf.toString('utf8').trim()));
    cmd.stderr.on('data', (buf) => console.error(buf.toString('utf8').trim()));

    await new Promise((resolve, reject) => {
        cmd.on('close', resolve);
        cmd.on('error', reject);
    });
}
