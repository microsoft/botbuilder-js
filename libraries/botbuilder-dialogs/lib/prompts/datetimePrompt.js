"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = require("./prompt");
//import * as Recognizers from '@microsoft/recognizers-text-date-time';
const Recognizers = require('@microsoft/recognizers-text-date-time');
const dateTimeModel = Recognizers.DateTimeRecognizer.instance.getDateTimeModel('en-us');
class DatetimePrompt {
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
        const results = dateTimeModel.parse(utterance);
        const value = results.length > 0 && results[0].resolution ? (results[0].resolution.values || []) : [];
        if (this.validator) {
            // Call validator for further processing
            return Promise.resolve(this.validator(context, value, dialogs));
        }
        else if (value.length > 0) {
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
exports.DatetimePrompt = DatetimePrompt;
//# sourceMappingURL=datetimePrompt.js.map