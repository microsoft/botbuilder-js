// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import util from 'util';

// eslint-disable-next-line security/detect-non-literal-fs-filename
export const readFile = util.promisify(fs.readFile);

/**
 * Reads a file as JSON and coerces to type `T`
 *
 * @template T expected type of JSON
 * @param {string} path absolute path to a file to read as JSON
 * @returns {Promise<T | undefined>} A promise that resolves to `T` or undefined
 */
export async function readJsonFile<T>(path: string): Promise<T | undefined> {
    try {
        const rawPackageJson = await readFile(path, 'utf8');
        return JSON.parse(rawPackageJson);
    } catch (err) {
        return undefined;
    }
}

// eslint-disable-next-line security/detect-non-literal-fs-filename
export const writeFile = util.promisify(fs.writeFile);

/**
 * Write data to a file
 *
 * @template T type of data (inferred)
 * @param {string} path absolute file path
 * @param {T} data data to write to file
 * @returns {Promise<void>} a promise representing the operation
 */
export function writeJsonFile<T>(path: string, data: T): Promise<void> {
    return writeFile(path, JSON.stringify(data, null, 2));
}
