"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
 */
class TextPrompt extends prompt_1.Prompt {
    /**
     * Creates a new `TextPrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     */
    constructor(dialogId, validator) {
        super(dialogId, validator);
        this.prompt = prompts.createTextPrompt();
    }
    onPrompt(context, state, options, isRetry) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isRetry && options.retryPrompt) {
                yield this.prompt.prompt(context, options.retryPrompt);
            }
            else if (options.prompt) {
                yield this.prompt.prompt(context, options.prompt);
            }
        });
    }
    onRecognize(context, state, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.prompt.recognize(context);
            return value !== undefined ? { succeeded: true, value: value } : { succeeded: false };
        });
    }
}
exports.TextPrompt = TextPrompt;
//# sourceMappingURL=textPrompt.js.map