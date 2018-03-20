"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Utility function to calculate a change hash for a `StoreItem`.
 *
 * | package |
 * | ------- |
 * | botbuilder-core-extensions |
 *
 * @param item Item to calculate the change hash for.
 */
function calculateChangeHash(item) {
    const cpy = Object.assign({}, item);
    if (cpy.eTag) {
        delete cpy.eTag;
    }
    ;
    return JSON.stringify(cpy);
}
exports.calculateChangeHash = calculateChangeHash;
//# sourceMappingURL=storage.js.map