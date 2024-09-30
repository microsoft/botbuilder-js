/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

declare global {
    interface MapIterator<T> extends IterableIterator<T> {}
}

// @ts-ignore - the following export is only required for projects referencing adaptive-expressions, otherwise it will fail at build time.
export * from '../../../lib';
