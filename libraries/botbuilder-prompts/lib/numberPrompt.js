"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = require("./internal");
const Recognizers = require("@microsoft/recognizers-text-number");
/**
 * Creates a new prompt that asks the user to reply with a number.
 *
 * @remarks
 * This example creates a number prompt with a custom validator that constrains the users answer to
 * a range of numbers and then rounds off any fractional replies:
 *
 * ```JavaScript
 * const { createNumberPrompt } = require('botbuilder-prompts');
 *
 * const agePrompt = createNumberPrompt(async (context, value) => {
 *    if (typeof value == 'number') {
 *       if (value >= 1 && value < 111) {
 *          // Return age rounded down to nearest whole number.
 *          return Math.floor(value);
 *       }
 *    }
 *    await agePrompt.prompt(context, `Please enter a number between 1 and 110 or say "cancel".`);
 *    return undefined;
 * });
 * ```
 * @param O (Optional) type of result returned by the `recognize()` method. This defaults to `number` but can be changed by the prompts custom validator.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 * @param defaultLocale (Optional) locale to use if `context.activity.locale` not specified. Defaults to a value of `en-us`.
 */
function createNumberPrompt(validator, defaultLocale) {
    return {
        prompt: function prompt(context, prompt, speak) {
            return internal_1.sendPrompt(context, prompt, speak);
        },
        recognize: function recognize(context) {
            const request = context.activity || {};
            const utterance = request.text || '';
            const locale = request.locale || defaultLocale || 'en-us';
            const results = Recognizers.recognizeNumber(utterance, locale);
            const value = results.length > 0 && results[0].resolution ? parseFloat(results[0].resolution.value) : undefined;
            return Promise.resolve(validator ? validator(context, value) : value);
        }
    };
}
exports.createNumberPrompt = createNumberPrompt;
//# sourceMappingURL=numberPrompt.js.map