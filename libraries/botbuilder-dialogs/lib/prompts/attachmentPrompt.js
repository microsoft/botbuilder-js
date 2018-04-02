"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const prompts = require("botbuilder-prompts");
/**
 * Prompts a user to upload attachments like images. By default the prompt will return to the
 * calling dialog a `Attachment[]` but this can be overridden using a custom `PromptValidator`.
 *
 * **Example usage:**
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
 *          return dc.prompt('attachmentPrompt', `Send me image(s)`);
 *      },
 *      async function (dc, attachments) {
 *          await dc.context.sendActivity(`Processing ${attachments.length} images.`);
 *          return dc.end();
 *      }
 * ]);
 * ```
 */
class AttachmentPrompt extends prompt_1.Prompt {
    /**
     * Creates a new instance of the prompt.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * dialogs.add('imagePrompt', new AttachmentPrompt(async (context, values) => {
     *      if (!Array.isArray(values) || values.length < 1) {
     *          await context.sendActivity(`Send me an image or say "cancel".`);
     *          return undefined;
     *      } else {
     *          return values;
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     */
    constructor(validator) {
        super(validator);
        this.prompt = prompts.createAttachmentPrompt();
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
exports.AttachmentPrompt = AttachmentPrompt;
//# sourceMappingURL=attachmentPrompt.js.map