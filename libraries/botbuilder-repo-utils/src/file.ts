// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'fs/promises';

// reads a file at `path` as JSON
export async function readJsonFile<T>(path: string): Promise<T | undefined> {
    try {
        const rawPackageJson = await fs.readFile(path, 'utf8');
        return JSON.parse(rawPackageJson);
    } catch (err) {
        return undefined;
    }
}

// writes JSON.stringified `data` to `path`
export function writeJsonFile<T>(path: string, data: T): Promise<void> {
    return fs.writeFile(path, JSON.stringify(data, null, 2));
}
