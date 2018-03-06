"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const choicePrompt_1 = require("./choicePrompt");
const Recognizers = require("@microsoft/recognizers-text-choice");
/**
 * Prompts a user to confirm something with a yes/no response. By default the prompt will return
 * to the calling dialog a `boolean` representing the users selection.
 *
 * **Example usage:**
 *
 * ```JavaScript
 * const { DialogSet, ConfirmPrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('confirmPrompt', new ConfirmPrompt());
 *
 * dialogs.add('confirmDemo', [
 *      function (context) {
 *          return dialogs.prompt(context, 'confirmPrompt', `confirm: answer "yes" or "no"`);
 *      },
 *      function (context, value) {
 *          context.reply(`Recognized value: ${value}`);
 *          return dialogs.end(context);
 *      }
 * ]);
 * ```
 */
class ConfirmPrompt {
    /**
     * Creates a new instance of the prompt.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * dialogs.add('confirmPrompt', new ConfirmPrompt((context, value) => {
     *      if (value === undefined) {
     *          context.reply(`Please answer with "yes" or "no".`);
     *          return Prompts.resolve();
     *      } else {
     *          return dialogs.end(context, values);
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     */
    constructor(validator) {
        this.validator = validator;
        this.stylerOptions = { includeNumbers: false };
    }
    begin(context, dialogs, options) {
        // Persist options
        const instance = dialogs.getInstance(context);
        instance.state = options || {};
        // Send initial prompt
        if (instance.state.prompt) {
            return this.sendChoicePrompt(context, dialogs, instance.state.prompt, instance.state.speak);
        }
        else {
            return Promise.resolve();
        }
    }
    continue(context, dialogs) {
        // Recognize value
        const options = dialogs.getInstance(context).state;
        const utterance = context.request && context.request.text ? context.request.text : '';
        const results = Recognizers.recognizeBoolean(utterance, 'en-us');
        const value = results.length > 0 && results[0].resolution ? results[0].resolution.value : undefined;
        if (this.validator) {
            // Call validator for further processing
            return Promise.resolve(this.validator(context, value, dialogs));
        }
        else if (typeof value === 'boolean') {
            // Return recognized value
            return dialogs.end(context, value);
        }
        else if (options.retryPrompt) {
            // Send retry prompt to user
            return this.sendChoicePrompt(context, dialogs, options.retryPrompt, options.retrySpeak);
        }
        else if (options.prompt) {
            // Send original prompt to user
            return this.sendChoicePrompt(context, dialogs, options.prompt, options.speak);
        }
        else {
            return Promise.resolve();
        }
    }
    sendChoicePrompt(context, dialogs, prompt, speak) {
        if (typeof prompt === 'string') {
            // Get locale specific choices
            let locale = context.request && context.request.locale ? context.request.locale.toLowerCase() : '*';
            if (!ConfirmPrompt.choices.hasOwnProperty(locale)) {
                locale = '*';
            }
            const choices = ConfirmPrompt.choices[locale];
            // Reply with formatted prompt
            const style = dialogs.getInstance(context).state.style;
            context.reply(choicePrompt_1.formatChoicePrompt(context, choices, prompt, speak, this.stylerOptions, style));
        }
        else {
            context.reply(prompt);
        }
        return Promise.resolve();
    }
}
/**
 * Allows for the localization of the confirm prompts yes/no choices to other locales besides
 * english. The key of each entry is the languages locale code and should be lower cased. A
 * default fallback set of choices can be specified using a key of '*'.
 *
 * **Example usage:**
 *
 * ```JavaScript
 * // Configure yes/no choices for english and spanish (default)
 * ConfirmPrompt.choices['*'] = ['sí', 'no'];
 * ConfirmPrompt.choices['es'] = ['sí', 'no'];
 * ConfirmPrompt.choices['en-us'] = ['yes', 'no'];
 * ```
 */
ConfirmPrompt.choices = { '*': ['yes', 'no'] };
exports.ConfirmPrompt = ConfirmPrompt;
//# sourceMappingURL=confirmPrompt.js.map