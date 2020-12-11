// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Delay resolution of a promise.
 *
 * @template T type that promise will yield, defaults to `void`
 * @param {number} milliseconds how long to delay
 * @param {Promise<T>} promise an optional promise to delay
 * @returns {Promise<T>} a promise that will resolve to the result of `promise`, delayed by `milliseconds`.
 */
export function delay<T = void>(milliseconds: number, promise?: Promise<T>): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(promise), milliseconds));
}
