"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = require("./internal");
/**
 * Creates a new prompt that asks the user to upload one or more attachments.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 */
function createAttachmentPrompt(validator) {
    return {
        prompt: function prompt(context, prompt, speak) {
            return internal_1.sendPrompt(context, prompt, speak);
        },
        recognize: function recognize(context) {
            const values = context.activity ? context.activity.attachments : undefined;
            return Promise.resolve(validator ? validator(context, values) : values);
        }
    };
}
exports.createAttachmentPrompt = createAttachmentPrompt;
//# sourceMappingURL=attachmentPrompt.js.map