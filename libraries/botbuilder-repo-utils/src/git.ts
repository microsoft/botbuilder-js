// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import util from 'util';
import { exec } from 'child_process';

const execp = util.promisify(exec);

/**
 * Computes the absolute path of the root of the repo
 *
 * @returns {Promise<string>} returns absolute path of repo root
 */
export async function gitRoot(): Promise<string> {
    const { stdout } = await execp('git rev-parse --show-toplevel');
    return stdout.trim();
}

/**
 * Fetches the current sha pointed to by `ref`
 *
 * @param {string} ref git reference to fetch commit sha for
 * @param {number} truncate how many characters to include in commit sha
 * @returns {Promise<string>} returns commit sha `ref` points to
 */
export async function gitSha(ref: string, truncate = 7): Promise<string> {
    const { stdout } = await execp(`git rev-parse --short=${truncate} ${ref}`);
    return stdout.trim();
}
