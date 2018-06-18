"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = require("./internal");
/**
 * Creates a new prompt that asks the user to enter some text.
 *
 * @remarks
 * This example shows creating a text prompt with a custom validator that ensures the length of
 * the users answer matches some minimum length requirement:
 *
 * ```JavaScript
 * const { createTextPrompt } = require('botbuilder-prompts');
 *
 * const namePrompt = createTextPrompt(async (context, value) => {
 *    if (value && value.length >= 3) {
 *       return value;
 *    }
 *    await namePrompt.prompt(context, `Your entry must be at least 3 characters in length.`);
 *    return undefined;
 * });
 * ```
 * @param O (Optional) type of result returned by the `recognize()` method. This defaults to return a `string` but can be changed by the prompts custom validator.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 */
function createTextPrompt(validator) {
    return {
        prompt: function prompt(context, prompt, speak) {
            return internal_1.sendPrompt(context, prompt, speak);
        },
        recognize: function recognize(context) {
            const value = context.activity && context.activity.text ? context.activity.text : '';
            return Promise.resolve(validator ? validator(context, value) : value);
        }
    };
}
exports.createTextPrompt = createTextPrompt;
//# sourceMappingURL=textPrompt.js.map