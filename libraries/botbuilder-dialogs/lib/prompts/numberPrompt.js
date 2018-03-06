"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const Recognizers = require("@microsoft/recognizers-text-number");
/**
 * Prompts a user to enter a number. By default the prompt will return to the calling dialog
 * a `number` representing the users input.
 *
 * **Example usage:**
 *
 * ```JavaScript
 * const { DialogSet, NumberPrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('numberPrompt', new NumberPrompt());
 *
 * dialogs.add('numberDemo', [
 *      function (context) {
 *          return dialogs.prompt(context, 'numberPrompt', `number: enter a number`);
 *      },
 *      function (context, value) {
 *          context.reply(`Recognized value: ${value}`);
 *          return dialogs.end(context);
 *      }
 * ]);
 * ```
 */
class NumberPrompt {
    /**
     * Creates a new instance of the prompt.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * dialogs.add('agePrompt', new NumberPrompt((context, value) => {
     *      if (value === undefined || value < 1 || value > 110) {
     *          context.reply(`Please enter a valid age between 1 and 110.`);
     *          return Promise.resolve();
     *      } else {
     *          return dialogs.end(context, value);
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     */
    constructor(validator) {
        this.validator = validator;
    }
    begin(context, dialogs, options) {
        // Persist options
        const instance = dialogs.getInstance(context);
        instance.state = options || {};
        // Send initial prompt
        if (instance.state.prompt) {
            context.reply(prompt_1.formatPrompt(instance.state.prompt, instance.state.speak));
        }
        return Promise.resolve();
    }
    continue(context, dialogs) {
        // Recognize value
        const options = dialogs.getInstance(context).state;
        const utterance = context.request && context.request.text ? context.request.text : '';
        const results = Recognizers.recognizeNumber(utterance, 'en-us');
        const value = results.length > 0 && results[0].resolution ? parseFloat(results[0].resolution.value) : undefined;
        if (this.validator) {
            // Call validator for further processing
            return Promise.resolve(this.validator(context, value, dialogs));
        }
        else if (typeof value === 'number') {
            // Return recognized value
            return dialogs.end(context, value);
        }
        else {
            if (options.retryPrompt) {
                // Send retry prompt to user
                context.reply(prompt_1.formatPrompt(options.retryPrompt, options.retrySpeak));
            }
            else if (options.prompt) {
                // Send original prompt to user
                context.reply(prompt_1.formatPrompt(options.prompt, options.speak));
            }
            return Promise.resolve();
        }
    }
}
exports.NumberPrompt = NumberPrompt;
//# sourceMappingURL=numberPrompt.js.map