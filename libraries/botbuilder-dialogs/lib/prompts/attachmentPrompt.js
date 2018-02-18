"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
class AttachmentPrompt {
    constructor(validator) {
        this.validator = validator;
    }
    begin(context, dialogs, options) {
        // Persist options
        const instance = dialogs.getInstance(context);
        instance.state = options || {};
        // Send initial prompt
        if (instance.state.prompt) {
            context.reply(prompt_1.formatPrompt(instance.state.prompt, instance.state.speak));
        }
        return Promise.resolve();
    }
    continue(context, dialogs) {
        // Recognize value
        const options = dialogs.getInstance(context).state;
        const values = context.request && context.request.attachments ? context.request.attachments : [];
        if (this.validator) {
            // Call validator for further processing
            return Promise.resolve(this.validator(context, values, dialogs));
        }
        else if (values.length > 0) {
            // Return recognized values
            return dialogs.end(context, values);
        }
        else {
            if (options.retryPrompt) {
                // Send retry prompt to user
                context.reply(prompt_1.formatPrompt(options.retryPrompt, options.retrySpeak));
            }
            else if (options.prompt) {
                // Send original prompt to user
                context.reply(prompt_1.formatPrompt(options.prompt, options.speak));
            }
            return Promise.resolve();
        }
    }
}
exports.AttachmentPrompt = AttachmentPrompt;
//# sourceMappingURL=attachmentPrompt.js.map