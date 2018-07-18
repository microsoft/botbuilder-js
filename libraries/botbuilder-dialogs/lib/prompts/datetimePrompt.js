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
const dialog_1 = require("../dialog");
const prompt_1 = require("./prompt");
const prompts = require("botbuilder-prompts");
/**
 * Prompts a user to enter a datetime expression.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `FoundDatetime[]` but this can be
 * overridden using a custom `PromptValidator`.
 *
 * #### Prompt Usage
 *
 * When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named
 * dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either
 * `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted to reply with a
 * date and/or time. The recognized date/time will be passed as an argument to the callers next
 * waterfall step:
 *
 * ```JavaScript
 * const { DialogSet, DatetimePrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('datetimePrompt', new DatetimePrompt(AlarmTimeValidator));
 *
 * dialogs.add('setAlarmTime', [
 *      async function (dc) {
 *          await dc.prompt('datetimePrompt', `What time should I set your alarm for?`);
 *      },
 *      async function (dc, time) {
 *          await dc.context.sendActivity(`Alarm time set`);
 *          await dc.end();
 *      }
 * ]);
 *
 * async function AlarmTimeValidator(context, values) {
 *     try {
 *         if (!Array.isArray(values) || values.length < 0) { throw new Error('missing time') }
 *         if (values[0].type !== 'datetime') { throw new Error('unsupported type') }
 *         const value = new Date(values[0].value);
 *         if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
 *         return value;
 *     } catch (err) {
 *         await context.sendActivity(`Answer with a time in the future like "tomorrow at 9am" or say "cancel".`);
 *         return undefined;
 *     }
 * }
 * ```
 * @param O (Optional) output type returned by prompt. This defaults to a `FoundDatetime[]` but can be changed by a custom validator passed to the prompt.
 */
class DatetimePrompt extends prompt_1.Prompt {
    /**
     * Creates a new `DatetimePrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(validator, defaultLocale) {
        super(validator);
        this.prompt = prompts.createDatetimePrompt(undefined, defaultLocale);
    }
    onPrompt(dc, options, isRetry) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isRetry && options.retryPrompt) {
                yield this.prompt.prompt(dc.context, options.retryPrompt, options.retrySpeak);
            }
            else if (options.prompt) {
                yield this.prompt.prompt(dc.context, options.prompt, options.speak);
            }
            return dialog_1.Dialog.EndOfTurn;
        });
    }
    onRecognize(dc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prompt.recognize(dc.context);
        });
    }
}
exports.DatetimePrompt = DatetimePrompt;
//# sourceMappingURL=datetimePrompt.js.map