// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import util from 'util';

// eslint-disable-next-line security/detect-non-literal-fs-filename
export const readFile = util.promisify(fs.readFile);

// reads a file at `path` as JSON
export async function readJsonFile<T>(path: string): Promise<T | null> {
    try {
        const rawPackageJson = await readFile(path, 'utf8');
        return JSON.parse(rawPackageJson);
    } catch (err) {
        return null;
    }
}

// eslint-disable-next-line security/detect-non-literal-fs-filename
export const writeFile = util.promisify(fs.writeFile);

// writes JSON.stringified `data` to `path`
export function writeJsonFile<T>(path: string, data: T): Promise<void> {
    return writeFile(path, JSON.stringify(data, null, 2));
}
