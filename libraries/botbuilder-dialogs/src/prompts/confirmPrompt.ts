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
 *      function (dc) {
 *          return dc.prompt('confirmPrompt', `confirm: answer "yes" or "no"`);
 *      },
 *      function (dc, value) {
 *          dc.batch.reply(`Recognized value: ${value}`);
 *          return dc.end();
 *      }
 * ]);
 * ```
 */
export class ConfirmPrompt<C extends BotContext> extends Prompt<C, boolean> {
    private prompt: prompts.ConfirmPrompt;

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
    static choices: prompts.ConfirmChoices = { '*': ['yes', 'no'] };

    /**
     * Creates a new instance of the prompt.
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * dialogs.add('confirmPrompt', new ConfirmPrompt((dc, value) => {
     *      if (value === undefined) {
     *          dc.batch.reply(`Invalid answer. Answer with "yes" or "no".`);
     *          return undefined;
     *      } else {
     *          return value;
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.  
     * @param defaultLocale (Optional) locale to use if `dc.context.request.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(validator?: PromptValidator<C, boolean>, defaultLocale?: string) {
        super(validator);
        this.prompt = prompts.createConfirmPrompt(undefined, defaultLocale);
        this.prompt.choices = ConfirmPrompt.choices;
    }

    /**
     * Sets additional options passed to the `ChoiceFactory` and used to tweak the style of choices 
     * rendered to the user.
     * @param options Additional options to set.
     */
    public choiceOptions(options: prompts.ChoiceFactoryOptions): this {
        Object.assign(this.prompt.choiceOptions, options);
        return this;
    }

    /**
     * Sets the style of the yes/no choices rendered to the user when prompting.
     * @param listStyle Type of list to render to to user. Defaults to `ListStyle.auto`.
     */
    public style(listStyle: prompts.ListStyle): this {
        this.prompt.style = listStyle;
        return this;
    }
    
    protected onPrompt(dc: DialogContext<C>, options: PromptOptions, isRetry: boolean): Promise<void> {
        if (isRetry && options.retryPrompt) {
            return this.prompt.prompt(dc.context, options.retryPrompt, options.retrySpeak);
        } else if (options.prompt) {
            return this.prompt.prompt(dc.context, options.prompt, options.speak);
        }
        return Promise.resolve();
    }

    protected onRecognize(dc: DialogContext<C>, options: PromptOptions): Promise<boolean|undefined> {
        return this.prompt.recognize(dc.context);
    }
}
