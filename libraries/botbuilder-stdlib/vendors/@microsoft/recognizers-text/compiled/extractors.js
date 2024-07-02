"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExtractResult {
    static isOverlap(erA, erB) {
        return !(erA.start >= erB.start + erB.length) && !(erB.start >= erA.start + erA.length);
    }
    static isCover(er1, er2) {
        return ((er2.start < er1.start) && ((er2.start + er2.length) >= (er1.start + er1.length)))
            || ((er2.start <= er1.start) && ((er2.start + er2.length) > (er1.start + er1.length)));
    }
    static getFromText(source) {
        return {
            start: 0,
            length: source.length,
            text: source,
            type: 'custom'
        };
    }
}
exports.ExtractResult = ExtractResult;
//# sourceMappingURL=extractors.js.map