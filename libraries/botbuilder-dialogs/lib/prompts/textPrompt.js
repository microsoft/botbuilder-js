"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const prompts = require("botbuilder-prompts");
/**
 * Prompts a user to enter some text.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `string` representing the users reply.
 *
 * #### Prompt Usage
 *
 * When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named
 * dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either
 * `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted with a question
 * and the response will be passed as an argument to the callers next waterfall step:
 *
 * ```JavaScript
 * const { DialogSet, TextPrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('namePrompt', new TextPrompt());
 *
 * dialogs.add('askName', [
 *      async function (dc) {
 *          await dc.prompt('namePrompt', `What's your name?`);
 *      },
 *      async function (dc, name) {
 *          await dc.context.sendActivity(`Hi ${name}!`);
 *          await dc.end();
 *      }
 * ]);
 * ```
 * The prompt can be configured with a custom validator to perform additional checks like ensuring
 * that the user responds with a valid age and that only whole numbers are returned:
 *
 * ```JavaScript
 * dialogs.add('namePrompt', new TextPrompt(async (context, value) => {
 *    if (value && value.length >= 3) {
 *       return value;
 *    }
 *    await context.sendActivity(`Your entry must be at least 3 characters in length.`);
 *    return undefined;
 * }));
 * ```
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param O (Optional) output type returned by prompt. This defaults to a `string` but can be changed by a custom validator passed to the prompt.
 */
class TextPrompt extends prompt_1.Prompt {
    /**
     * Creates a new `TextPrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     */
    constructor(validator) {
        super(validator);
        this.prompt = prompts.createTextPrompt();
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
exports.TextPrompt = TextPrompt;
//# sourceMappingURL=textPrompt.js.map