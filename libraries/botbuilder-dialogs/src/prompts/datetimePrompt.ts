/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator, formatPrompt } from './prompt';
//import * as Recognizers from '@microsoft/recognizers-text-date-time';
const Recognizers = require('@microsoft/recognizers-text-date-time');

const dateTimeModel = Recognizers.DateTimeRecognizer.instance.getDateTimeModel('en-us');

export interface FoundDatetime {
    timex: string;
    type: string;
    value: string;
}

export class DatetimePrompt implements Dialog {

    constructor(private validator?: PromptValidator<FoundDatetime[]>) {}

    public begin(context: BotContext, dialogs: DialogSet, options: PromptOptions): Promise<void> {
        // Persist options
        const instance = dialogs.getInstance<PromptOptions>(context);
        instance.state = options || {};

        // Send initial prompt
        if (instance.state.prompt) { context.reply(formatPrompt(instance.state.prompt, instance.state.speak)) }
        return Promise.resolve();
    }

    public continue(context: BotContext, dialogs: DialogSet): Promise<void> {
        // Recognize value
        const options = dialogs.getInstance<PromptOptions>(context).state;
        const utterance = context.request && context.request.text ? context.request.text : '';
        const results = dateTimeModel.parse(utterance);
        const value: FoundDatetime[] = results.length > 0 && results[0].resolution ? (results[0].resolution.values || []) : [];
        if (this.validator) {
            // Call validator for further processing
            return Promise.resolve(this.validator(context, value, dialogs));
        } else if (value.length > 0) {
            // Return recognized value
            return dialogs.end(context, value);
        } else {
            if (options.retryPrompt) {
                // Send retry prompt to user
                context.reply(formatPrompt(options.retryPrompt, options.retrySpeak));
            } else if (options.prompt) {
                // Send original prompt to user
                context.reply(formatPrompt(options.prompt, options.speak));
            }
            return Promise.resolve();
        }
    }
}
