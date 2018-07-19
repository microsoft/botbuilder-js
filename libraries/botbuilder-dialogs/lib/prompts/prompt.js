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
const lib_1 = require("../../../botbuilder/lib");
const dialog_1 = require("../dialog");
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
            // Initialize prompt state
            const state = dc.activeDialog.state;
            state.state = {};
            state.options = Object.assign({}, options);
            // Send initial prompt
            return yield this.onPrompt(dc, state.options, false);
        });
    }
    dialogContinue(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // Don't do anything for non-message activities
            if (dc.context.activity.type === lib_1.ActivityTypes.Message) {
                // Perform base recognition
                const state = dc.activeDialog.state;
                const recognized = yield this.onRecognize(dc, state.options);
                // Validate the return value
                let end = false;
                let endResult;
                if (this.validator) {
                    yield this.validator(dc.context, {
                        result: recognized,
                        state: state.state,
                        options: state.options,
                        end: (output) => {
                            end = true;
                            endResult = output;
                        }
                    });
                }
                else if (recognized !== undefined) {
                    end = true;
                    endResult = recognized;
                }
                // Return recognized value or re-prompt
                if (end) {
                    return yield dc.end(endResult);
                }
                else if (!dc.context.responded) {
                    return yield this.onPrompt(dc, state.options, true);
                }
                else {
                    return dialog_1.Dialog.EndOfTurn;
                }
            }
        });
    }
    dialogReprompt(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = dc.activeDialog.state;
            return yield this.onPrompt(dc, state.options, true);
        });
    }
    dialogResume(dc, result) {
        // Prompts are typically leaf nodes on the stack but the dev is free to push other dialogs
        // on top of the stack which will result in the prompt receiving an unexpected call to
        // dialogResume() when the pushed on dialog ends. 
        // To avoid the prompt prematurely ending we need to implement this method and 
        // simply re-prompt the user.
        return this.dialogReprompt(dc);
    }
}
exports.Prompt = Prompt;
//# sourceMappingURL=prompt.js.map