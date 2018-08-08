"use strict";
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @private
 */
function shallowCopy(value) {
    if (Array.isArray(value)) {
        return value.slice(0);
    }
    if (typeof value === 'object') {
        return Object.assign({}, value);
    }
    return value;
}
exports.shallowCopy = shallowCopy;
/**
 * @private
 * @param target
 * @param handler
 */
function makeRevocable(target, handler) {
    // Ensure proxy supported (some browsers don't)
    if (Proxy && Proxy.revocable) {
        return Proxy.revocable(target, handler || {});
    }
    else {
        return { proxy: target, revoke: () => { } };
    }
}
exports.makeRevocable = makeRevocable;
//# sourceMappingURL=internal.js.map