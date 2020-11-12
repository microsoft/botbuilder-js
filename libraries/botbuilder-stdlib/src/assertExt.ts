// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import assert from 'assert';
import { Newable } from 'ts-essentials';
import { tests } from './types';

/**
 * Asserts `condition` to the Typescript compiler
 *
 * @param {any} condition a condition to assert
 * @param {string} message error message
 * @param {Newable<Error>} ctor an optional constructor that makes Error instances
 */
export function assertCondition(condition: unknown, message: string, ctor: Newable<Error> = Error): asserts condition {
    if (!condition) {
        throw new ctor(message);
    }
}

/**
 * Executes `block` and ensures it throws an exception with `message`
 *
 * @param {(...args: any[]) => any} block a function that should throw
 * @param {string} message expected error message
 */
export function throwsMessage(block: (...args: unknown[]) => unknown, message: string): void {
    try {
        block();
    } catch (err) {
        assertCondition(tests.isError(err), 'expected block to throw an Error');
        assert.strictEqual(err.message, message);
        return;
    }

    throw new Error('promise did not throw');
}
