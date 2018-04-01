/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
import { DialogContext } from '../dialogContext';
import { Prompt, PromptOptions, PromptValidator } from './prompt';
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
export declare class TextPrompt<C extends TurnContext> extends Prompt<C, string> {
    private prompt;
    /**
     * Creates a new instance of the prompt.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * dialogs.add('titlePrompt', new TextPrompt((dc, value) => {
     *      if (!value || value.length < 3) {
     *          dc.batch.reply(`Title should be at least 3 characters long.`);
     *          return undefined;
     *      } else {
     *          return value.trim();
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     */
    constructor(validator?: PromptValidator<C, string>);
    protected onPrompt(dc: DialogContext<C>, options: PromptOptions, isRetry: boolean): Promise<void>;
    protected onRecognize(dc: DialogContext<C>, options: PromptOptions): Promise<string | undefined>;
}
