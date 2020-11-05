// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Newable } from 'ts-essentials';

/**
 * Assert a condition to the typescript compiler
 *
 * @param {any} condition condition to assert
 * @param {string} message error message if condition fails
 * @param {Newable<Error>} errorCtor a reference to an Error constructor, defaults to TypeError
 */
export function assert(condition: unknown, message: string, errorCtor: Newable<Error> = TypeError): asserts condition {
    if (!condition) {
        throw new errorCtor(message);
    }
}
