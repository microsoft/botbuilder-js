// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import util from 'util';
import { exec } from 'child_process';

const execp = util.promisify(exec);

// returns the path of the root of this git repo
export async function gitRoot(): Promise<string> {
    const { stdout } = await execp('git rev-parse --show-toplevel');
    return stdout.trim();
}
