/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotContext } from 'botbuilder';
import { DialogContext } from '../dialogContext';
import { Prompt, PromptOptions, PromptValidator } from './prompt';
import * as prompts from 'botbuilder-prompts';

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
 *      function (dc) {
 *          return dc.prompt('textPrompt', `text: enter some text`);
 *      },
 *      function (dc, value) {
 *          dc.batch.reply(`Recognized value: ${value}`);
 *          return dc.end();
 *      }
 * ]);
 * ```
 */
export class TextPrompt<C extends BotContext> extends Prompt<C, string> {
    private prompt: prompts.TextPrompt;

    /**
     * Creates a new instance of the prompt.
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * dialogs.add('titlePrompt', new TextPrompt((dc, value) => {
     *      if (value.length < 3) {
     *          dc.batch.reply(`Title should be at least 3 characters long.`);
     *          return undefined;
     *      } else {
     *          return value.trim();
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.  
     */
    constructor(validator?: PromptValidator<C, string>) {
        super(validator);
        this.prompt = prompts.createTextPrompt(); 
    }

    protected onPrompt(dc: DialogContext<C>, options: PromptOptions, isRetry: boolean): Promise<void> {
        if (isRetry && options.retryPrompt) {
            return this.prompt.prompt(dc.context, options.retryPrompt, options.retrySpeak);
        } else if (options.prompt) {
            return this.prompt.prompt(dc.context, options.prompt, options.speak);
        }
        return Promise.resolve();
    }

    protected onRecognize(dc: DialogContext<C>, options: PromptOptions): Promise<string|undefined> {
        return this.prompt.recognize(dc.context);
    }
}
