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
const Recognizers = require("@microsoft/recognizers-text-number");
/**
 * Prompts a user to enter a number.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `number` representing the users input.
 */
class NumberPrompt extends prompt_1.Prompt {
    /**
     * Creates a new `NumberPrompt` instance.
     * @param dialogId Unique ID of the dialog within its parent `DialogSet`.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(dialogId, validator, defaultLocale) {
        super(dialogId, validator);
        this.defaultLocale = defaultLocale;
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
            const result = { succeeded: false };
            const activity = context.activity;
            const utterance = activity.text;
            const locale = activity.locale || this.defaultLocale || 'en-us';
            const results = Recognizers.recognizeNumber(utterance, locale);
            if (results.length > 0 && results[0].resolution) {
                result.succeeded = true;
                result.value = parseFloat(results[0].resolution.value);
            }
            return result;
        });
    }
}
exports.NumberPrompt = NumberPrompt;
//# sourceMappingURL=numberPrompt.js.map