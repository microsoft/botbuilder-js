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
class SequenceDialog extends dialog_1.Dialog {
    constructor(dialogId, steps) {
        super(dialogId);
        let index = 0;
        this.steps = steps.map((s) => {
            return {
                id: s.getId(index++),
                step: s
            };
        });
    }
    dialogBegin(dc, dialogArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.runNextStep(dc, Object.assign({}, dialogArgs));
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
    runNextStep(dc, values, afterId) {
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
                    values: values,
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
            const step = {
                id: state.stepId,
                result: result,
                values: state.values,
                state: state.stepState,
                next: () => this.runNextStep(dc, state.values, state.stepId)
            };
            return yield this.onRunStep(dc, step);
        });
    }
    onRunStep(dc, step) {
        return __awaiter(this, void 0, void 0, function* () {
            const steps = this.steps.filter((s) => s.id === step.id);
            return yield steps[0].step.onStep(dc, step);
        });
    }
}
exports.SequenceDialog = SequenceDialog;
//# sourceMappingURL=sequenceDialog.js.map