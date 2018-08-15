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
const prompt_1 = require("./prompt");
/**
 * Prompts a user to enter some text.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `string` representing the users reply.
 */
class TextPrompt extends prompt_1.Prompt {
    /**
     * Creates a new `TextPrompt` instance.
     * @param dialogId Unique ID of the dialog within its parent `DialogSet`.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     */
    constructor(dialogId, validator) {
        super(dialogId, validator);
    }
    onPrompt(context, state, options, isRetry) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isRetry && options.retryPrompt) {
                yield context.sendActivity(options.retryPrompt, undefined, botbuilder_core_1.InputHints.ExpectingInput);
            }
            else if (options.prompt) {
                yield context.sendActivity(options.prompt, undefined, botbuilder_core_1.InputHints.ExpectingInput);
            }
        });
    }
    onRecognize(context, state, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = context.activity.text;
            return typeof value === 'string' && value.length > 0 ? { succeeded: true, value: value } : { succeeded: false };
        });
    }
}
exports.TextPrompt = TextPrompt;
//# sourceMappingURL=textPrompt.js.map