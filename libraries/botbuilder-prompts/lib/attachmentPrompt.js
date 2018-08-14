"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = require("./internal");
/**
 * Creates a new prompt that asks the user to upload one or more attachments.
 *
 * @remarks
 * This example shows creating a prompt with a custom validator that ensures an image attachment has
 * been uploaded by the user:
 *
 * ```JavaScript
 * const { createAttachmentPrompt } = require('botbuilder-prompts');
 *
 * const imagePrompt = createAttachmentPrompt(async (context, values) => {
 *    if (values && values.length > 0) {
 *       for (let i = 0; i < values.length; i++) {
 *          if (!values[i].contentType.startsWith('image')) {
 *             await imagePrompt.prompt(context, `Only images are accepted.`);
 *             return undefined;
 *          }
 *       }
 *    } else {
 *       await imagePrompt.prompt(context, `Please upload at least one image.`);
 *    }
 *    return values;
 * });
 * ```
 * @param O (Optional) type of result returned by the `recognize()` method. This defaults to an `attachment[]` but can be changed by the prompts custom validator.
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