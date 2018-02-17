"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
class TextPrompt {
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
        // Recognize value and call validator
        const utterance = context.request && context.request.text ? context.request.text : '';
        if (this.validator) {
            return Promise.resolve(this.validator(context, utterance, dialogs));
        }
        else {
            // Default behavior is to just return recognized value
            return dialogs.end(context, utterance);
        }
    }
}
exports.TextPrompt = TextPrompt;
//# sourceMappingURL=textPrompt.js.map