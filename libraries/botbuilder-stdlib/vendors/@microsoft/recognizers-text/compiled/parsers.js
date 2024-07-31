"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extractors_1 = require("./extractors");
class ParseResult extends extractors_1.ExtractResult {
    constructor(er) {
        super();
        if (er) {
            this.length = er.length;
            this.start = er.start;
            this.data = er.data;
            this.text = er.text;
            this.type = er.type;
        }
        this.resolutionStr = "";
    }
}
exports.ParseResult = ParseResult;
//# sourceMappingURL=parsers.js.map