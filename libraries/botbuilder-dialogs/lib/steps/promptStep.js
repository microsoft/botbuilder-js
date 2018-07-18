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
 * Calls a prompt with a set of options, stores the users input in the sequences `values`
 * collection, and then moves to the next step within the sequence.
 *
 * @remarks
 * By default the prompt is only called if the value doesn't already exist within the `values`
 * collection. The `PromptStepOptions.alwaysPrompt` option can be used to force the user to be
 * prompted regardless of whether a value exists in the `values` collection.
 */
class PromptStep {
    constructor(valueName, promptDialogId, promptOrOptions, choices) {
        this.valueName = valueName;
        this.promptDialogId = promptDialogId;
        if (typeof promptOrOptions === 'object' && promptOrOptions.prompt !== undefined) {
            this.promptOptions = Object.assign({}, promptOrOptions);
            this.alwaysPrompt = !!promptOrOptions.alwaysPrompt;
        }
        else {
            this.promptOptions = { prompt: promptOrOptions, choices: choices };
            this.alwaysPrompt = false;
        }
    }
    getId(stepIndex) {
        // Return a unique ID.
        return 'PromptStep:' + this.valueName;
    }
    onStep(dc, step) {
        return __awaiter(this, void 0, void 0, function* () {
            // Have we prompted the user already?
            const state = step.state;
            if (state.prompted) {
                // Save result to 'values' collection.
                step.values[this.valueName] = step.result;
                return yield step.next();
            }
            else {
                // Should we prompt for value?
                const value = step.values[this.valueName];
                if (value === undefined || this.alwaysPrompt) {
                    // Call prompt.
                    state.prompted = true;
                    return yield dc.prompt(this.promptDialogId, this.promptOptions);
                }
                else {
                    // Skip to next step.
                    return yield step.next();
                }
            }
        });
    }
}
exports.PromptStep = PromptStep;
//# sourceMappingURL=promptStep.js.map