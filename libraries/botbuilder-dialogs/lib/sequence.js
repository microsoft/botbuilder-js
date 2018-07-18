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
const dialog_1 = require("./dialog");
class Sequence extends dialog_1.Dialog {
    constructor(steps) {
        super();
        let index = 0;
        this.steps = steps.map((s) => {
            return {
                id: s.getId(index++),
                step: s
            };
        });
    }
    dialogBegin(dc, args) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.runNextStep(dc, Object.assign({}, args));
        });
    }
    dialogContinue(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = dc.activeDialog.state;
            return yield this.runStep(dc, state);
        });
    }
    dialogResume(dc, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = dc.activeDialog.state;
            return yield this.runStep(dc, state, result);
        });
    }
    runNextStep(dc, form, afterId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find next step id
            let index = 0;
            if (afterId) {
                for (let i = 0; i < this.steps.length; i++) {
                    if (this.steps[i].id === afterId) {
                        index = i + 1;
                        break;
                    }
                }
            }
            if (index < this.steps.length) {
                // Update state
                const state = {
                    values: form,
                    stepId: this.steps[0].id,
                    stepState: {}
                };
                dc.activeDialog.state = state;
                return yield this.runStep(dc, state);
            }
            else {
                return yield dc.end();
            }
        });
    }
    runStep(dc, state, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const steps = this.steps.filter((s) => s.id === state.stepId);
            const sc = {
                result: result,
                values: state.values,
                state: state.stepState,
                next: () => this.runNextStep(dc, state.values, state.stepId)
            };
            return yield steps[0].step.onStep(dc, sc);
        });
    }
}
exports.Sequence = Sequence;
//# sourceMappingURL=sequence.js.map