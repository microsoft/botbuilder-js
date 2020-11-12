// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'fs';
import util from 'util';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// reads a file at `path` as JSON
export async function readJsonFile<T>(path: string): Promise<T | undefined> {
    try {
        const rawPackageJson = await readFile(path, 'utf8');
        return JSON.parse(rawPackageJson);
    } catch (err) {
        return undefined;
    }
}

// writes JSON.stringified `data` to `path`
export function writeJsonFile<T>(path: string, data: T): Promise<void> {
    return writeFile(path, JSON.stringify(data, null, 2));
}
