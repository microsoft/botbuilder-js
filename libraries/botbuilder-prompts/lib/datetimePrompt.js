"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = require("./internal");
const Recognizers = require("@microsoft/recognizers-text-date-time");
/**
 * Creates a new prompt that asks the user to reply with a date or time.
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