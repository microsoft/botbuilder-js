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
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_core_1 = require("botbuilder-core");
const dialog_1 = require("../dialog");
/**
 * Base class for all prompts.
 */
class ActivityPrompt extends dialog_1.Dialog {
    constructor(dialogId, validator) {
        super(dialogId);
        this.validator = validator;
    }
    onPrompt(context, state, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.prompt) {
                yield context.sendActivity(options.prompt, undefined, botbuilder_core_1.InputHints.ExpectingInput);
            }
        });
    }
    onRecognize(context, state, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return { succeeded: true, value: context.activity };
        });
    }
    dialogBegin(dc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure prompts have input hint set
            const opt = Object.assign({}, options);
            if (opt.prompt && typeof opt.prompt === 'object' && typeof opt.prompt.inputHint !== 'string') {
                opt.prompt.inputHint = botbuilder_core_1.InputHints.ExpectingInput;
            }
            if (opt.retryPrompt && typeof opt.retryPrompt === 'object' && typeof opt.retryPrompt.inputHint !== 'string') {
                opt.retryPrompt.inputHint = botbuilder_core_1.InputHints.ExpectingInput;
            }
            // Initialize prompt state
            const state = dc.activeDialog.state;
            state.options = opt;
            state.state = {};
            // Send initial prompt
            yield this.onPrompt(dc.context, state.state, state.options);
            return dialog_1.Dialog.EndOfTurn;
        });
    }
    dialogContinue(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // Perform base recognition
            const state = dc.activeDialog.state;
            const recognized = yield this.onRecognize(dc.context, state.state, state.options);
            // Validate the return value
            let end = false;
            let endResult;
            yield this.validator(dc.context, {
                recognized: recognized,
                state: state.state,
                options: state.options,
                end: (output) => {
                    if (end) {
                        throw new Error(`PromptValidatorContext.end(): method already called for the turn.`);
                    }
                    end = true;
                    endResult = output;
                }
            });
            // Return recognized value or re-prompt
            if (end) {
                return yield dc.end(endResult);
            }
            else {
                return dialog_1.Dialog.EndOfTurn;
            }
        });
    }
    dialogResume(dc, reason, result) {
        return __awaiter(this, void 0, void 0, function* () {
            // Prompts are typically leaf nodes on the stack but the dev is free to push other dialogs
            // on top of the stack which will result in the prompt receiving an unexpected call to
            // dialogResume() when the pushed on dialog ends. 
            // To avoid the prompt prematurely ending we need to implement this method and 
            // simply re-prompt the user.
            yield this.dialogReprompt(dc.context, dc.activeDialog);
            return dialog_1.Dialog.EndOfTurn;
        });
    }
    dialogReprompt(context, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = instance.state;
            yield this.onPrompt(context, state.state, state.options);
        });
    }
}
exports.ActivityPrompt = ActivityPrompt;
//# sourceMappingURL=activityPrompt.js.map