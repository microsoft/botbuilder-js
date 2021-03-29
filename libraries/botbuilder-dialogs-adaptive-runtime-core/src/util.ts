// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Necessary to help coerce `keyof T` keys to strings. Only used internally to this class.
export const stringify = <K extends string | number | symbol>(k: K): string =>
    typeof k === 'string' ? k : k.toString();
