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
const choices_1 = require("../choices");
const dialog_1 = require("../dialog");
/**
 * Controls the way that choices for a `ChoicePrompt` or yes/no options for a `ConfirmPrompt` are
 * presented to a user.
 */
var ListStyle;
(function (ListStyle) {
    /** Don't include any choices for prompt. */
    ListStyle[ListStyle["none"] = 0] = "none";
    /** Automatically select the appropriate style for the current channel. */
    ListStyle[ListStyle["auto"] = 1] = "auto";
    /** Add choices to prompt as an inline list. */
    ListStyle[ListStyle["inline"] = 2] = "inline";
    /** Add choices to prompt as a numbered list. */
    ListStyle[ListStyle["list"] = 3] = "list";
    /** Add choices to prompt as suggested actions. */
    ListStyle[ListStyle["suggestedAction"] = 4] = "suggestedAction";
})(ListStyle = exports.ListStyle || (exports.ListStyle = {}));
/**
 * Base class for all prompts.
 */
class Prompt extends dialog_1.Dialog {
    constructor(dialogId, validator) {
        super(dialogId);
        this.validator = validator;
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
            yield this.onPrompt(dc.context, state.state, state.options, false);
            return dialog_1.Dialog.EndOfTurn;
        });
    }
    dialogContinue(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // Don't do anything for non-message activities
            if (dc.context.activity.type !== botbuilder_core_1.ActivityTypes.Message) {
                return dialog_1.Dialog.EndOfTurn;
            }
            // Perform base recognition
            const state = dc.activeDialog.state;
            const recognized = yield this.onRecognize(dc.context, state.state, state.options);
            // Validate the return value
            let end = false;
            let endResult;
            if (this.validator) {
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
            }
            else if (recognized.succeeded) {
                end = true;
                endResult = recognized.value;
            }
            // Return recognized value or re-prompt
            if (end) {
                return yield dc.end(endResult);
            }
            else {
                if (!dc.context.responded) {
                    yield this.onPrompt(dc.context, state.state, state.options, true);
                }
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
            yield this.onPrompt(context, state.state, state.options, false);
        });
    }
    appendChoices(prompt, channelId, choices, style, options) {
        // Get base prompt text (if any)
        let text = '';
        if (typeof prompt === 'string') {
            text = prompt;
        }
        else if (prompt && prompt.text) {
            text = prompt.text;
        }
        // Create temporary msg
        let msg;
        switch (style) {
            case ListStyle.inline:
                msg = choices_1.ChoiceFactory.inline(choices, text, null, options);
                break;
            case ListStyle.list:
                msg = choices_1.ChoiceFactory.list(choices, text, null, options);
                break;
            case ListStyle.suggestedAction:
                msg = choices_1.ChoiceFactory.suggestedAction(choices, text);
                break;
            case ListStyle.none:
                msg = botbuilder_core_1.MessageFactory.text(text);
                break;
            default:
                msg = choices_1.ChoiceFactory.forChannel(channelId, choices, text, null, options);
                break;
        }
        // Update prompt with text and actions
        if (typeof prompt === 'object') {
            prompt.text = msg.text;
            if (msg.suggestedActions && Array.isArray(msg.suggestedActions.actions) && msg.suggestedActions.actions.length > 0) {
                prompt.suggestedActions = msg.suggestedActions;
            }
            return prompt;
        }
        else {
            msg.inputHint = botbuilder_core_1.InputHints.ExpectingInput;
            return msg;
        }
    }
}
exports.Prompt = Prompt;
//# sourceMappingURL=prompt.js.map