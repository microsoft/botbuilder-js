"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const Recognizers = require("@microsoft/recognizers-text-date-time");
/**
 * Prompts a user to enter a datetime expression. By default the prompt will return to the
 * calling dialog a `FoundDatetime[]` but this can be overridden using a custom `PromptValidator`.
 *
 * **Example usage:**
 *
 * ```JavaScript
 * const { DialogSet, DatetimePrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('datetimePrompt', new DatetimePrompt());
 *
 * dialogs.add('datetimeDemo', [
 *      function (context) {
 *          return dialogs.prompt(context, 'datetimePrompt', `datetime: enter a datetime`);
 *      },
 *      function (context, values) {
 *          context.reply(`Recognized values: ${JSON.stringify(values)}`);
 *          return dialogs.end(context);
 *      }
 * ]);
 * ```
 */
class DatetimePrompt {
    /**
     * Creates a new instance of the prompt.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * dialogs.add('timePrompt', new DatetimePrompt((context, values) => {
     *      try {
     *          if (values.length < 0) { throw new Error('missing time') }
     *          if (values[0].type !== 'datetime') { throw new Error('unsupported type') }
     *          const value = new Date(values[0].value);
     *          if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
     *          return dialogs.end(context, value);
     *      } catch (err) {
     *          context.reply(`Please enter a valid time in the future like "tomorrow at 9am" or say "cancel".`);
     *          return Promise.resolve();
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
        const results = Recognizers.recognizeDateTime(utterance, 'en-us');
        const value = results.length > 0 && results[0].resolution ? (results[0].resolution.values || []) : [];
        if (this.validator) {
            // Call validator for further processing
            return Promise.resolve(this.validator(context, value, dialogs));
        }
        else if (value.length > 0) {
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
exports.DatetimePrompt = DatetimePrompt;
//# sourceMappingURL=datetimePrompt.js.map