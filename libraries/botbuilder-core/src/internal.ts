/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * @private
 */
 export function shallowCopy<T>(value: T): T {
    if (Array.isArray(value)) { return value.slice(0) as any }
    if (typeof value === 'object') { return Object.assign({}, value) }
    return value;
}

/**
 * @private
 * @param target 
 * @param handler 
 */
export function makeRevocable<T extends Object>(target: T, handler?: ProxyHandler<T>): { proxy: T; revoke: () => void; } {
    // Ensure proxy supported (some browsers don't)
    if (Proxy && Proxy.revocable) {
        return Proxy.revocable(target, handler || {});
    } else {
        return { proxy: target, revoke: () => {} };
    }
}