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
import * as Recognizers from '@microsoft/recognizers-text-number';

/**
 * Prompts a user to enter a number. By default the prompt will return to the calling dialog 
 * a `number` representing the users input.
 * 
 * **Example usage:**
 * 
 * ```JavaScript
 * const { DialogSet, NumberPrompt } = require('botbuilder-dialogs');
 * 
 * const dialogs = new DialogSet();
 * 
 * dialogs.add('numberPrompt', new NumberPrompt());
 * 
 * dialogs.add('numberDemo', [
 *      function (context) {
 *          return dialogs.prompt(context, 'numberPrompt', `number: enter a number`);
 *      },
 *      function (context, value) {
 *          context.reply(`Recognized value: ${value}`);
 *          return dialogs.end(context);
 *      }
 * ]);
 * ```
 */
export class NumberPrompt implements Dialog {
    /**
     * Creates a new instance of the prompt.
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * dialogs.add('agePrompt', new NumberPrompt((context, value) => {
     *      if (value === undefined || value < 1 || value > 110) {
     *          context.reply(`Please enter a valid age between 1 and 110.`);
     *          return Promise.resolve();
     *      } else {
     *          return dialogs.end(context, value);
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     */
    constructor(private validator?: PromptValidator<number|undefined>) {}

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
        const results = Recognizers.recognizeNumber(utterance, 'en-us');
        const value = results.length > 0 && results[0].resolution ? parseFloat(results[0].resolution.value) : undefined;
        if (this.validator) {
            // Call validator for further processing
            return Promise.resolve(this.validator(context, value, dialogs));
        } else if (typeof value === 'number') {
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
