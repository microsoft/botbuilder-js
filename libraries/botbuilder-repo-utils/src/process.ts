// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { exec, spawn } from 'child_process';
import { slice } from 'lodash';
import util from 'util';

const execp = util.promisify(exec);

export async function execute(
    bin: string,
    args: string[],
    options: Record<'cwd', string>
): Promise<Record<'stdout' | 'stderr', string>> {
    const { stdout, stderr } = await execp([bin, ...args].join(' '), options);
    return { stdout: stdout.trim(), stderr: stderr.trim() };
}

export async function stream(bin: string, args: string[], options: { cwd: string; quiet?: boolean }): Promise<void> {
    const cmd = spawn(bin, args, options);

    if (!options.quiet) {
        cmd.stdout.on('data', (buf) => console.log(buf.toString('utf8').trim()));
        cmd.stderr.on('data', (buf) => console.error(buf.toString('utf8').trim()));
    }

    await new Promise((resolve, reject) => {
        cmd.on('close', resolve);
        cmd.on('error', reject);
    });
}
