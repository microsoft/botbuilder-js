"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
const Recognizers = require("@microsoft/recognizers-text-number");
const numberModel = Recognizers.NumberRecognizer.instance.getNumberModel('en-us');
class NumberPrompt {
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
        const utterance = context.request && context.request.text ? context.request.text : '';
        const results = numberModel.parse(utterance);
        const value = results.length > 0 && results[0].resolution ? parseFloat(results[0].resolution.value) : undefined;
        if (this.validator) {
            // Call validator for further processing
            return Promise.resolve(this.validator(context, value, dialogs));
        }
        else if (typeof value === 'number') {
            // Return recognized value
            return dialogs.end(context, value);
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
exports.NumberPrompt = NumberPrompt;
//# sourceMappingURL=numberPrompt.js.map