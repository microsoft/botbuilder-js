"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = require("./internal");
/**
 * Creates a new prompt that asks the user to enter some text.
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