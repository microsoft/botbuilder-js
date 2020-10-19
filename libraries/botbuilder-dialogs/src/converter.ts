/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * The converter converts object from one type to another.
 */
export interface Converter<From = unknown, To = unknown> {
    convert(value: From | To): To;
}

export type ConverterFactory<From = unknown, To = unknown> = {
    new (...args: unknown[]): Converter<From, To>;
};
