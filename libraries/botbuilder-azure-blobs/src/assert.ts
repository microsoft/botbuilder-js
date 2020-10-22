// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Newable } from 'ts-essentials';

/**
 * Assert a condition to the typescript compiler
 * @param condition condition to assert
 * @param message error message if condition fails
 * @param errorCtor a reference to an Error constructor
 */
export function assert(condition: any, message: string, errorCtor: Newable<Error> = TypeError): asserts condition {
    if (!condition) {
        throw new errorCtor(message);
    }
}
