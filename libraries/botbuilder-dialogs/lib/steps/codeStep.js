"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class CodeStep {
    constructor(idOrHandler, handler) {
        if (typeof idOrHandler === 'string') {
            this.id = idOrHandler;
            this.handler = handler;
        }
        else {
            this.handler = idOrHandler;
        }
    }
    onStep(dc, step) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.handler(dc, step);
        });
    }
}
exports.CodeStep = CodeStep;
//# sourceMappingURL=codeStep.js.map