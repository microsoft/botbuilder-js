"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const prompts = require("botbuilder-prompts");
/**
 * Prompts a user to enter some text. By default the prompt will return to the calling
 * dialog a `string` representing the users reply.
 *
 * **Example usage:**
 *
 * ```JavaScript
 * const { DialogSet, TextPrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('textPrompt', new TextPrompt());
 *
 * dialogs.add('textDemo', [
 *      async function (dc) {
 *          return dc.prompt('textPrompt', `text: enter some text`);
 *      },
 *      async function (dc, value) {
 *          await dc.context.sendActivity(`Recognized value: ${value}`);
 *          return dc.end();
 *      }
 * ]);
 * ```
 */
class TextPrompt extends prompt_1.Prompt {
    /**
     * Creates a new instance of the prompt.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * dialogs.add('titlePrompt', new TextPrompt(async (context, value) => {
     *      if (!value || value.length < 3) {
     *          await context.sendActivity(`Title should be at least 3 characters long.`);
     *          return undefined;
     *      } else {
     *          return value.trim();
     *      }
     * }));
     * ```
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