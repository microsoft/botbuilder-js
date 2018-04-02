"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const prompts = require("botbuilder-prompts");
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
 *      async function (dc) {
 *          return dc.prompt('datetimePrompt', `datetime: enter a datetime`);
 *      },
 *      async function (dc, values) {
 *          await dc.context.sendActivity(`Recognized values: ${JSON.stringify(values)}`);
 *          return dc.end();
 *      }
 * ]);
 * ```
 */
class DatetimePrompt extends prompt_1.Prompt {
    /**
     * Creates a new instance of the prompt.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * dialogs.add('timePrompt', new DatetimePrompt(async (context, values) => {
     *      try {
     *          if (!Array.isArray(values) || values.length < 0) { throw new Error('missing time') }
     *          if (values[0].type !== 'datetime') { throw new Error('unsupported type') }
     *          const value = new Date(values[0].value);
     *          if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
     *          return value;
     *      } catch (err) {
     *          await context.sendActivity(`Invalid time. Answer with a time in the future like "tomorrow at 9am" or say "cancel".`);
     *          return undefined;
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(validator, defaultLocale) {
        super(validator);
        this.prompt = prompts.createDatetimePrompt(undefined, defaultLocale);
    }
    onPrompt(dc, options, isRetry) {
        if (isRetry && options.retryPrompt) {
            return this.prompt.prompt(dc.context, options.retryPrompt, options.retrySpeak);
        }
        else if (options.prompt) {
            return this.prompt.prompt(dc.context, options.prompt, options.speak);
        }
        return Promise.resolve();
    }
    onRecognize(dc, options) {
        return this.prompt.recognize(dc.context);
    }
}
exports.DatetimePrompt = DatetimePrompt;
//# sourceMappingURL=datetimePrompt.js.map