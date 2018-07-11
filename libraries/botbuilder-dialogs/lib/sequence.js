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
const botbuilder_1 = require("botbuilder");
const dialog_1 = require("./dialog");
class Sequence extends dialog_1.Dialog {
    constructor() {
        super(...arguments);
        this.steps = [];
    }
    add(step) {
        this.steps.push({ id: step.id || this.steps.length.toString(), step: step });
        return this;
    }
    dialogBegin(dc, args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.runNextStep(dc, Object.assign({}, args));
        });
    }
    dialogContinue(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // Don't do anything for non-message activities
            if (dc.context.activity.type === botbuilder_1.ActivityTypes.Message) {
                const state = dc.activeDialog.state;
                yield this.runStep(dc, state);
            }
        });
    }
    dialogResume(dc, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = dc.activeDialog.state;
            yield this.runStep(dc, state, result);
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
                    form: form,
                    stepId: this.steps[0].id,
                    stepState: {}
                };
                dc.activeDialog.state = state;
                yield this.runStep(dc, state);
            }
            else {
                yield dc.end();
            }
        });
    }
    runStep(dc, state, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const steps = this.steps.filter((s) => s.id === state.stepId);
            const sc = {
                result: result,
                form: state.form,
                stepState: state.stepState,
                next: () => this.runNextStep(dc, state.form, state.stepId)
            };
            yield steps[0].step.onStep(dc, sc);
        });
    }
}
exports.Sequence = Sequence;
//# sourceMappingURL=sequence.js.map