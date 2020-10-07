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
export interface Converter<From = any, To = any> {
    convert(value: From): To;
}

export type Converters<T> = {
    [K in keyof Partial<Omit<T, 'converters' | 'configure'>>]:
        | Converter<any, T[K]>
        | ((...args: any[]) => Converter<any, T[K]>);
}
