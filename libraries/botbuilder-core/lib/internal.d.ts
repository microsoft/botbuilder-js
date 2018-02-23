/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export declare function shallowCopy<T>(value: T): T;
export declare function makeRevocable<T extends Object>(target: T, handler?: ProxyHandler<T>): {
    proxy: T;
    revoke: () => void;
};
