/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * @private
 */
export declare function shallowCopy<T>(value: T): T;
/**
 * @private
 * @param target
 * @param handler
 */
export declare function makeRevocable<T extends Object>(target: T, handler?: ProxyHandler<T>): {
    proxy: T;
    revoke: () => void;
};
