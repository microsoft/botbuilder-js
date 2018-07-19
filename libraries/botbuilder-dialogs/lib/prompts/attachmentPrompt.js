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
const dialog_1 = require("../dialog");
const prompt_1 = require("./prompt");
const prompts = require("../../../botbuilder-prompts/lib");
/**
 * Prompts a user to upload attachments like images.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `Attachment[]` but this can be
 * overridden using a custom `PromptValidator`.
 *
 * #### Prompt Usage
 *
 * When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named
 * dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either
 * `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted to upload one or
 * more attachments which will be passed as an argument to the callers next waterfall step:
 *
 * ```JavaScript
 * const { DialogSet, AttachmentPrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('attachmentPrompt', new AttachmentPrompt());
 *
 * dialogs.add('uploadImage', [
 *      async function (dc) {
 *          await dc.prompt('attachmentPrompt', `Send me image(s)`);
 *      },
 *      async function (dc, attachments) {
 *          await dc.context.sendActivity(`Processing ${attachments.length} images.`);
 *          await dc.end();
 *      }
 * ]);
 * ```
 *
 * If the users response to the prompt fails to be recognized they will be automatically re-prompted
 * to try again. By default the original prompt is re-sent to the user but you can provide an
 * alternate prompt to send by passing in additional options:
 *
 * ```JavaScript
 * await dc.prompt('attachmentPrompt', `Send me image(s)`, { retryPrompt: `I didn't get anything. Send me an image.` });
 * ```
 *
 * The prompts retry logic can also be completely customized by passing the prompts constructor a
 * custom validator:
 *
 * ```JavaScript
 * dialogs.add('imagePrompt', new AttachmentPrompt(async (context, values) => {
 *    if (values && values.length > 0) {
 *       for (let i = 0; i < values.length; i++) {
 *          if (!values[i].contentType.startsWith('image')) {
 *             await context.sendActivity(`Only images are accepted.`);
 *             return undefined;
 *          }
 *       }
 *    } else {
 *       await context.sendActivity(`Please upload at least one image.`);
 *    }
 *    return values;
 * }));
 * ```
 * @param O (Optional) output type returned by prompt. This defaults to an `Attachment[]` but can be changed by a custom validator passed to the prompt.
 */
class AttachmentPrompt extends prompt_1.Prompt {
    /**
     * Creates a new `AttachmentPrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     */
    constructor(dialogId, validator) {
        super(dialogId, validator);
        this.prompt = prompts.createAttachmentPrompt();
    }
    onPrompt(dc, options, isRetry) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isRetry && options.retryPrompt) {
                yield this.prompt.prompt(dc.context, options.retryPrompt, options.retrySpeak);
            }
            else if (options.prompt) {
                yield this.prompt.prompt(dc.context, options.prompt, options.speak);
            }
            return dialog_1.Dialog.EndOfTurn;
        });
    }
    onRecognize(dc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prompt.recognize(dc.context);
        });
    }
}
exports.AttachmentPrompt = AttachmentPrompt;
//# sourceMappingURL=attachmentPrompt.js.map