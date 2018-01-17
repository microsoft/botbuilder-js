"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-prompts
 */
/** second comment block */
const prompt_1 = require("./prompt");
const botbuilder_core_1 = require("botbuilder-core");
const localizedPrompts = require("./localized-prompts");
/**
 * Prompts the user to upload an attachment.
 *
 * **Usage Example**
 *
 * ```js
 * // define prompt
 * const photoPrompt = new AttachmentPrompt('photoPrompt', (context, state) => {
 *      const photo = state.value[0];
 *
 *      // ... do something with photo ...
 *
 * });
 *
 * // use prompt
 * function promptForPhoto(context) {
 *      const prompt = photoPrompt.reply(`Send me the photo you'd like me to edit.`);
 *      context.begin(prompt);
 * }
 * ```
 *
 * @param W (Optional) type of parameters that can be passed to [with()](#with).
 * @param O (Optional) type of options supported by any derived classes.
 */
class AttachmentPrompt extends prompt_1.Prompt {
    constructor(uid, completed, prompter) {
        super(uid, AttachmentPrompt.validator, completed, prompter || AttachmentPrompt.prompter);
    }
    static validator(context, options) {
        const request = context.request;
        if (request.type === botbuilder_core_1.ActivityTypes.message && request.attachments && request.attachments.length > 0) {
            const value = request.attachments.slice(0);
            return { value: value };
        }
        return { error: 'invalid' };
    }
    static prompter(context, state) {
        if (state.turns === 0) {
            const prompt = state.options.prompt;
            if (prompt) {
                context.reply(prompt);
            }
        }
        else {
            const defaultPrompt = localizedPrompts.find(context.request.locale || 'en').default_attachment;
            context.reply(state.options.rePrompt || defaultPrompt);
        }
    }
}
exports.AttachmentPrompt = AttachmentPrompt;
//# sourceMappingURL=attachmentPrompt.js.map