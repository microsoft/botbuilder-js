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
class FillFieldStep {
    constructor(field, promptDialogId, prompt, choicesOrOptions, options) {
        this.field = field;
        this.promptDialogId = promptDialogId;
        this.prompt = prompt;
        this.choicesOrOptions = choicesOrOptions;
        this.options = options;
    }
    get id() {
        return this.field + '-prompt';
    }
    onStep(dc, step) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = step.stepState;
            if (state.prompted) {
                step.form[this.field] = step.result;
                yield step.next();
            }
            else {
                const value = step.form[this.field];
                if (value === undefined) {
                    state.prompted = true;
                    yield dc.prompt(this.promptDialogId, this.prompt, this.choicesOrOptions, this.options);
                }
                else {
                    yield step.next();
                }
            }
        });
    }
}
exports.FillFieldStep = FillFieldStep;
//# sourceMappingURL=fillFieldStep.js.map