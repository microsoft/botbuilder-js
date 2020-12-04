// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Newable } from './types';

/**
 * Maybe cast value to a particular type
 *
 * @template T type to maybe cast to
 * @param {any} value value to maybe cast
 * @param {Newable<T>} ctor optional class to perform instanceof check
 * @returns {T} value, maybe casted to T
 */
export function maybeCast<T>(value: unknown, ctor?: Newable<T>): T {
    if (ctor != null && value instanceof ctor) {
        return value;
    }

    return value as T;
}
