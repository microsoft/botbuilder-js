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
import * as Recognizers from '@microsoft/recognizers-text-date-time';

/**
 * Datetime result returned by `DatetimePrompt`. For more details see the LUIS docs for
 * [builtin.datetimev2](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-reference-prebuilt-entities#builtindatetimev2).
 */
export interface FoundDatetime {
    /** 
     * TIMEX expression representing ambiguity of the recognized time. 
     */
    timex: string;

    /** 
     * Type of time recognized. Possible values are 'date', 'time', 'datetime', 'daterange', 
     * 'timerange', 'datetimerange', 'duration', or 'set'.
     */
    type: string;

    /** 
     * Value of the specified [type](#type) that's a reasonable approximation given the ambiguity
     * of the [timex](#timex).
     */
    value: string;
}

/**
 * Prompts a user to enter a datetime expression. By default the prompt will return to the 
 * calling dialog a `FoundDatetime[]` but this can be overridden using a custom `PromptValidator`.
 * 
 * **Example usage:**
 * 
 * ```JavaScript
 * const { DialogSet, DatetimePrompt } = require('botbuilder-dialogs');
 * 
 * const dialogs = new DialogSet();
 * 
 * dialogs.add('datetimePrompt', new DatetimePrompt());
 * 
 * dialogs.add('datetimeDemo', [
 *      function (context) {
 *          return dialogs.prompt(context, 'datetimePrompt', `datetime: enter a datetime`);
 *      },
 *      function (context, values) {
 *          context.reply(`Recognized values: ${JSON.stringify(values)}`);
 *          return dialogs.end(context);
 *      }
 * ]);
 * ```
 */
export class DatetimePrompt implements Dialog {
    /**
     * Creates a new instance of the prompt.
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * dialogs.add('timePrompt', new DatetimePrompt((context, values) => {
     *      try {
     *          if (values.length < 0) { throw new Error('missing time') }
     *          if (values[0].type !== 'datetime') { throw new Error('unsupported type') }
     *          const value = new Date(values[0].value);
     *          if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
     *          return dialogs.end(context, value);
     *      } catch (err) {
     *          context.reply(`Please enter a valid time in the future like "tomorrow at 9am" or say "cancel".`);
     *          return Promise.resolve();
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     */
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
        const results = Recognizers.recognizeDateTime(utterance, 'en-us');
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
