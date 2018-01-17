"use strict";
/**
 * @module botbuilder-prompts
 */
/** second comment block */
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const botbuilder_core_1 = require("botbuilder-core");
/**
 * Prompts the user with a general question.
 *
 * **Usage Example:**
 *
 * ```js
 * // define prompt
 * const namePrompt = new TextPrompt('namePrompt', (context, state) => {
 *     const name = state.value;
 *
 *      // ... do something with value ...
 *
 * });
 *
 * // use prompt
 * function promptForName(context) {
 *     const prompt = namePrompt.reply(`Hi. What's your name?`);
 *     context.begin(prompt);
 * }
 * ```
 *
 * @param W (Optional) type of parameters that can be passed to [with()](#with).
 * @param O (Optional) type of options supported by any derived classes.
 */
class TextPrompt extends prompt_1.Prompt {
    constructor(uid, completed, prompter) {
        super(uid, TextPrompt.validator, completed, prompter);
        this.options.trimReply = true;
    }
    static validator(context, options) {
        options = options || {};
        if (context.request.type === botbuilder_core_1.ActivityTypes.message && context.request.text) {
            const text = context.request.text;
            const value = options.trimReply ? text.trim() : text;
            return { value: value };
        }
        return { error: 'invalid' };
    }
}
exports.TextPrompt = TextPrompt;
//# sourceMappingURL=textPrompt.js.map