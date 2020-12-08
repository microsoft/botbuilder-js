// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Newable } from './types';

// Represents an error constructor
export type NewableError = Newable<Error, [string]>;

/**
 * Asserts `condition` to the Typescript compiler
 *
 * @param {any} condition a condition to assert
 * @param {string} message error message
 * @param {NewableError} ctor an optional constructor that makes Error instances
 */
export function assertCondition(condition: unknown, message: string, ctor: NewableError = Error): asserts condition {
    if (!condition) {
        throw new ctor(message);
    }
}
