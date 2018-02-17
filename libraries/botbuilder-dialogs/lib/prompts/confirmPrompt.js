"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const choicePrompt_1 = require("./choicePrompt");
const Recognizers = require("@microsoft/recognizers-text-options");
const booleanModel = Recognizers.OptionsRecognizer.instance.getBooleanModel('en-us');
class ConfirmPrompt {
    constructor(validator) {
        this.validator = validator;
        this.stylerOptions = { includeNumbers: false };
        this.choices = { '*': ['yes', 'no'] };
    }
    begin(context, dialogs, options) {
        // Persist options
        const instance = dialogs.getInstance(context);
        instance.state = options || {};
        // Send initial prompt
        if (instance.state.prompt) {
            return this.sendChoicePrompt(context, dialogs, instance.state.prompt, instance.state.speak);
        }
        else {
            return Promise.resolve();
        }
    }
    continue(context, dialogs) {
        // Recognize value
        const options = dialogs.getInstance(context).state;
        const utterance = context.request && context.request.text ? context.request.text : '';
        const results = booleanModel.parse(utterance);
        const value = results.length > 0 && results[0].resolution ? results[0].resolution.value : undefined;
        if (this.validator) {
            // Call validator for further processing
            return Promise.resolve(this.validator(context, value, dialogs));
        }
        else if (typeof value === 'boolean') {
            // Return recognized value
            return dialogs.end(context, value);
        }
        else if (options.retryPrompt) {
            // Send retry prompt to user
            return this.sendChoicePrompt(context, dialogs, options.retryPrompt, options.retrySpeak);
        }
        else if (options.prompt) {
            // Send original prompt to user
            return this.sendChoicePrompt(context, dialogs, options.prompt, options.speak);
        }
        else {
            return Promise.resolve();
        }
    }
    sendChoicePrompt(context, dialogs, prompt, speak) {
        if (typeof prompt === 'string') {
            // Get locale specific choices
            let locale = context.request && context.request.locale ? context.request.locale.toLowerCase() : '*';
            if (!this.choices.hasOwnProperty(locale)) {
                locale = '*';
            }
            const choices = this.choices[locale];
            // Reply with formatted prompt
            const style = dialogs.getInstance(context).state.style;
            context.reply(choicePrompt_1.formatChoicePrompt(context, choices, prompt, speak, this.stylerOptions, style));
        }
        else {
            context.reply(prompt);
        }
        return Promise.resolve();
    }
}
exports.ConfirmPrompt = ConfirmPrompt;
//# sourceMappingURL=confirmPrompt.js.map