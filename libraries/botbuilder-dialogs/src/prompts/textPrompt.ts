/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotContext } from 'botbuilder';
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator, sendPrompt } from './prompt';

/**
 * Prompts a user to enter some text. By default the prompt will return to the calling 
 * dialog a `string` representing the users reply.
 * 
 * **Example usage:**
 * 
 * ```JavaScript
 * const { DialogSet, TextPrompt } = require('botbuilder-dialogs');
 * 
 * const dialogs = new DialogSet();
 * 
 * dialogs.add('textPrompt', new TextPrompt());
 * 
 * dialogs.add('textDemo', [
 *      function (context) {
 *          return dialogs.prompt(context, 'textPrompt', `text: enter some text`);
 *      },
 *      function (context, value) {
 *          context.reply(`Recognized value: ${value}`);
 *          return dialogs.end(context);
 *      }
 * ]);
 * ```
 */
export class TextPrompt<C extends BotContext> implements Dialog<C> {
    /**
     * Creates a new instance of the prompt.
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * dialogs.add('titlePrompt', new TextPrompt((context, value) => {
     *      if (value.length < 3) {
     *          context.reply(`Title should be at least 3 characters long.`);
     *          return Promise.resolve();
     *      } else {
     *          return dialogs.end(context, value.trim());
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     */
    constructor(private validator?: PromptValidator<C, string>) {}

    public begin(context: C, dialogs: DialogSet<C>, options: PromptOptions): Promise<void> {
        // Persist options
        const instance = dialogs.getInstance<PromptOptions>(context);
        instance.state = options || {};

        // Send initial prompt
        if (instance.state.prompt) { 
            return sendPrompt(context, instance.state.prompt, instance.state.speak); 
        }
        return Promise.resolve();
    }

    public continue(context: C, dialogs: DialogSet<C>): Promise<void> {
        // Recognize value and call validator
        const utterance = context.request && context.request.text ? context.request.text : '';
        if (this.validator) {
            return Promise.resolve(this.validator(context, utterance, dialogs));
        } else {
            // Default behavior is to just return recognized value
            return dialogs.end(context, utterance);
        }
    }
}
