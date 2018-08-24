/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * @private
 */
export function shallowCopy<T>(value: T): T {
    if (Array.isArray(value)) { return value.slice(0) as any; }
    // tslint:disable-next-line:prefer-object-spread
    if (typeof value === 'object') { return Object.assign({}, value); }

    return value;
}

/**
 * @private
 * @param target a thing that will be made revocable
 * @param handler an object that defines the way the new revocable object works
 */
export function makeRevocable<T extends Object>(target: T, handler?: ProxyHandler<T>): { proxy: T; revoke(): void } {
    // Ensure proxy supported (some browsers don't)
    if (Proxy && Proxy.revocable) {
        return Proxy.revocable(target, handler || {});
    } else {
        return { proxy: target, revoke: (): void => {
            // noop
        }};
    }
}
