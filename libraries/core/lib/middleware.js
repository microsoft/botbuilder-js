"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns true if a result that can (Optionally) be a Promise looks like a Promise.
 * @param result The result to test.
 */
function isPromised(result) {
    return result && result.then !== undefined;
}
exports.isPromised = isPromised;
//# sourceMappingURL=middleware.js.map