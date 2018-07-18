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
/**
 * Allows for the execution of a custom block of code within a `Sequence`.
 *
 * @remarks
 * Code steps can be used for a variety of purposes:
 *
 * - A code step can be used at the end of a sequence to assemble all of the `values` populated by
 *   other steps (like `PromptStep`) and then perform some action.
 * - A code step can be used at the beginning of a sequence to perform some pre-processing of the
 *   sequences `values` before executing the rest of the sequence.
 * - Code steps can be used in place of a `PromptStep` within the middle of a sequence to perform
 *   some custom logic before calling `dc.prompt()`.
 *
 * Code steps behave very similarly to waterfall steps. An individual code step is only ever
 * executed once per dialog invocation. If a code step executes and fails to call `step.next()`
 * before it ends then the users next utterance will cause the sequence to automatically move
 * the next step.
 *
 * If a step specifies a `valueName` and then starts another dialog, using either `dc.begin()` or
 * `dc.prompt()`, any result returned from that dialog will be saved to the sequences `values`
 * collection and then the sequence will move to the next step. *
 */
class CodeStep {
    constructor(valueNameOrHandler, handler) {
        if (typeof valueNameOrHandler === 'string') {
            this.valueName = valueNameOrHandler;
            this.handler = handler;
        }
        else {
            this.valueName = undefined;
            this.handler = valueNameOrHandler;
        }
    }
    getId(stepIndex) {
        // Return a unique ID.
        return 'CodeStep:' + (this.valueName || stepIndex.toString());
    }
    onStep(dc, step) {
        return __awaiter(this, void 0, void 0, function* () {
            // Have we called the handler already?
            const state = step.state;
            if (state.called) {
                // Optionally save result to values
                if (this.valueName) {
                    step.values[this.valueName] = step.result;
                }
                // Move to next step.
                return yield step.next();
            }
            else {
                // Call handler
                state.called = true;
                return yield this.handler(dc, step);
            }
        });
    }
}
exports.CodeStep = CodeStep;
//# sourceMappingURL=codeStep.js.map