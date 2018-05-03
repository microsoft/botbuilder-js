"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = require("./internal");
const Recognizers = require("@microsoft/recognizers-text-date-time");
/**
 * Creates a new prompt that asks the user to reply with a date or time.
 *
 * @remarks
 * This example shows creating a datetime prompt with a custom validator that constrains the users
 * answer to a time thats in the future:
 *
 * ```JavaScript
 * const { createDatetimePrompt } = require('botbuilder-prompts');
 *
 * const timePrompt = createDatetimePrompt(async (context, values) => {
 *    try {
 *       if (!Array.isArray(values) || values.length < 0) { throw new Error('missing time') }
 *       if (values[0].type !== 'datetime') { throw new Error('unsupported type') }
 *       const value = new Date(values[0].value);
 *       if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
 *       return value;
 *    } catch (err) {
 *       await timePrompt.prompt(context, `Answer with a time in the future like "tomorrow at 9am" or say "cancel".`);
 *       return undefined;
 *    }
 * });
 * ```
 * @param O (Optional) type of result returned by the `recognize()` method. This defaults to an instance of `FoundDateTime` but can be changed by the prompts custom validator.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 * @param defaultLocale (Optional) locale to use if `context.activity.locale` not specified. Defaults to a value of `en-us`.
 */
function createDatetimePrompt(validator, defaultLocale) {
    return {
        prompt: function prompt(context, prompt, speak) {
            return internal_1.sendPrompt(context, prompt, speak);
        },
        recognize: function recognize(context) {
            const request = context.activity || {};
            const utterance = request.text || '';
            const locale = request.locale || defaultLocale || 'en-us';
            const results = Recognizers.recognizeDateTime(utterance, locale);
            const values = results.length > 0 && results[0].resolution ? results[0].resolution.values : undefined;
            return Promise.resolve(validator ? validator(context, values) : values);
        }
    };
}
exports.createDatetimePrompt = createDatetimePrompt;
//# sourceMappingURL=datetimePrompt.js.map