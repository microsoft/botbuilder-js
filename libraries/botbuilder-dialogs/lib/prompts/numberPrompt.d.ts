/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator } from './prompt';
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
export declare class NumberPrompt implements Dialog {
    private validator;
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
    constructor(validator?: PromptValidator<number | undefined> | undefined);
    begin(context: BotContext, dialogs: DialogSet, options: PromptOptions): Promise<void>;
    continue(context: BotContext, dialogs: DialogSet): Promise<void>;
}
