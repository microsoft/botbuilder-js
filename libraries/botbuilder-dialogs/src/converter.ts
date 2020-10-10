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
    convert(value: From): To;
}

export type Properties<T> = {
    [K in keyof T]: T[K] extends Function ? never : T[K];
};

export type Converters<T> = {
    [K in keyof Partial<T>]: Converter<unknown, T[K]> | ((...args: unknown[]) => Converter<unknown, T[K]>);
};
