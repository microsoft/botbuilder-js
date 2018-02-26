"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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