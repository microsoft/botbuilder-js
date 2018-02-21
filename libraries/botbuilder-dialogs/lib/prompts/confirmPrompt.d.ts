/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity } from 'botbuilder';
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator } from './prompt';
import { ListStyle } from './choicePrompt';
import { ChoiceStylerOptions, Choice } from 'botbuilder-choices';
/** Map of `ConfirmPrompt` choices for each locale the bot supports. */
export interface ConfirmChoices {
    [locale: string]: (string | Choice)[];
}
/** Additional options that can be used to configure a `ChoicePrompt`. */
export interface ConfirmPromptOptions extends PromptOptions {
    /** Preferred style of the yes/no choices sent to the user. The default value is `ListStyle.auto`. */
    style?: ListStyle;
}
/**
 * Prompts a user to confirm something with a yes/no response. By default the prompt will return
 * to the calling dialog a `boolean` representing the users selection.
 *
 * **Example usage:**
 *
 * ```JavaScript
 * const { DialogSet, ConfirmPrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('confirmPrompt', new ConfirmPrompt());
 *
 * dialogs.add('confirmDemo', [
 *      function (context) {
 *          return dialogs.prompt(context, 'confirmPrompt', `confirm: answer "yes" or "no"`);
 *      },
 *      function (context, value) {
 *          context.reply(`Recognized value: ${value}`);
 *          return dialogs.end(context);
 *      }
 * ]);
 * ```
 */
export declare class ConfirmPrompt implements Dialog {
    private validator;
    /**
     * Allows for the localization of the confirm prompts yes/no choices to other locales besides
     * english. The key of each entry is the languages locale code and should be lower cased. A
     * default fallback set of choices can be specified using a key of '*'.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * // Configure yes/no choices for english and spanish (default)
     * ConfirmPrompt.choices['*'] = ['sí', 'no'];
     * ConfirmPrompt.choices['es'] = ['sí', 'no'];
     * ConfirmPrompt.choices['en-us'] = ['yes', 'no'];
     * ```
     */
    static choices: ConfirmChoices;
    /** Additional options passed to the `ChoiceStyler` and used to tweak the style of yes/no choices rendered to the user. */
    readonly stylerOptions: ChoiceStylerOptions;
    /**
     * Creates a new instance of the prompt.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * dialogs.add('confirmPrompt', new ConfirmPrompt((context, value) => {
     *      if (value === undefined) {
     *          context.reply(`Please answer with "yes" or "no".`);
     *          return Prompts.resolve();
     *      } else {
     *          return dialogs.end(context, values);
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     */
    constructor(validator?: PromptValidator<boolean | undefined> | undefined);
    begin(context: BotContext, dialogs: DialogSet, options: ConfirmPromptOptions): Promise<void>;
    continue(context: BotContext, dialogs: DialogSet): Promise<void>;
    protected sendChoicePrompt(context: BotContext, dialogs: DialogSet, prompt: string | Partial<Activity>, speak?: string): Promise<void>;
}
