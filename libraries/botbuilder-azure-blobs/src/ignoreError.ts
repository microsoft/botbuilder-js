/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { RestError } from '@azure/storage-blob';

/**
 * Describes an ignore error function
 */
export type IgnoreError = (err: Error) => boolean;

/**
 * Wrap a promise and provide a function to decide whether to ignore a type of error
 * @param promise A promise to await
 * @param ignore A method that returns true if an error should be ignored
 */
export async function ignoreError<T>(promise: Promise<T>, ignore: IgnoreError): Promise<T | null> {
    try {
        return await promise;
    } catch (err) {
        if (!ignore(err)) {
            throw err;
        } else {
            return null;
        }
    }
}

/**
 * Ignore RestErrors that match a set of status codes.
 * @param codes HTTP status codes that should not be considered errors
 */
export function isStatusCodeError(...codes: number[]): IgnoreError {
    const ignoredCodes = new Set(codes);
    return function (err) {
        return err instanceof RestError && ignoredCodes.has(err.statusCode);
    };
}
