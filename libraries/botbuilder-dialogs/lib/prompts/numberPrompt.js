"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const prompts = require("botbuilder-prompts");
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
 *      async function (dc) {
 *          return dc.prompt('numberPrompt', `number: enter a number`);
 *      },
 *      async function (dc, value) {
 *          await dc.context.sendActivity(`Recognized value: ${value}`);
 *          return dc.end();
 *      }
 * ]);
 * ```
 */
class NumberPrompt extends prompt_1.Prompt {
    /**
     * Creates a new instance of the prompt.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * dialogs.add('agePrompt', new NumberPrompt(async (context, value) => {
     *      if (value === undefined || value < 1 || value > 110) {
     *          await context.sendActivity(`Invalid age. Only ages between 1 and 110 are allowed.`);
     *          return undefined;
     *      } else {
     *          return value;
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(validator, defaultLocale) {
        super(validator);
        this.prompt = prompts.createNumberPrompt(undefined, defaultLocale);
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
exports.NumberPrompt = NumberPrompt;
//# sourceMappingURL=numberPrompt.js.map