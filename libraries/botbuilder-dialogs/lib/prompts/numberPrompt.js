"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const prompts = require("botbuilder-prompts");
/**
 * Prompts a user to enter a number.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `number` representing the users input.
 *
 * #### Prompt Usage
 *
 * When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named
 * dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either
 * `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted to reply with a
 * number which will be passed as an argument to the callers next waterfall step:
 *
 * ```JavaScript
 * const { DialogSet, NumberPrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('agePrompt', new NumberPrompt());
 *
 * dialogs.add('askAge', [
 *      async function (dc) {
 *          await dc.prompt('agePrompt', `How old are you?`);
 *      },
 *      async function (dc, age) {
 *          if (age < 40) {
 *              await dc.context.sendActivity(`So young :)`);
 *          } else {
 *              await dc.context.sendActivity(`I hear ${age} is the new ${age - 10} :)`);
 *          }
 *          await dc.end();
 *      }
 * ]);
 * ```
 *
 * The prompt can be configured with a custom validator to perform additional checks like ensuring
 * that the user responds with a valid age and that only whole numbers are returned:
 *
 * ```JavaScript
 * dialogs.add('agePrompt', new NumberPrompt(async (context, value) => {
 *    if (typeof value == 'number') {
 *       if (value >= 1 && value < 111) {
 *          // Return age rounded down to nearest whole number.
 *          return Math.floor(value);
 *       }
 *    }
 *    await context.sendActivity(`Please enter a number between 1 and 110 or say "cancel".`);
 *    return undefined;
 * }));
 * ```
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param O (Optional) output type returned by prompt. This defaults to a `number` but can be changed by a custom validator passed to the prompt.
 */
class NumberPrompt extends prompt_1.Prompt {
    /**
     * Creates a new `NumberPrompt` instance.
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