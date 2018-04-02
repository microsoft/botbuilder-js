/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
import { PromptValidator } from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { Prompt, PromptOptions } from './prompt';
import * as prompts from 'botbuilder-prompts';

/** Additional options that can be used to configure a `ChoicePrompt`. */
export interface ChoicePromptOptions extends PromptOptions {
    /** List of choices to recognize. */
    choices?: (string|prompts.Choice)[];
}

/**
 * Prompts a user to confirm something with a yes/no response. By default the prompt will return 
 * to the calling dialog a `boolean` representing the users selection.
 * 
 * **Example usage:**
 * 
 * ```JavaScript
 * const { DialogSet, ChoicePrompt } = require('botbuilder-dialogs');
 * 
 * const dialogs = new DialogSet();
 * 
 * dialogs.add('choicePrompt', new ChoicePrompt());
 * 
 * dialogs.add('choiceDemo', [
 *      async function (dc) {
 *          return dc.prompt('choicePrompt', `choice: select a color`, ['red', 'green', 'blue']);
 *      },
 *      async function (dc, choice) {
 *          await dc.context.sendActivity(`Recognized choice: ${JSON.stringify(choice)}`);
 *          return dc.end();
 *      }
 * ]);
 * ```
 */
export class ChoicePrompt<C extends TurnContext, O = prompts.FoundChoice> extends Prompt<C> {
    private prompt: prompts.ChoicePrompt<O>;

    /**
     * Creates a new instance of the prompt.
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * dialogs.add('choicePrompt', new ChoicePrompt(async (context, value) => {
     *      if (value === undefined) {
     *          await context.sendActivity(`I didn't recognize your choice. Please select from the choices on the list.`);
     *          return undefined;
     *      } else {
     *          return value;
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.  
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(validator?: PromptValidator<prompts.FoundChoice, O>, defaultLocale?: string) {
        super(validator);
        this.prompt = prompts.createChoicePrompt(undefined, defaultLocale);
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
     * Sets additional options passed to the `recognizeChoices()` function.
     * @param options Additional options to set.
     */
    public recognizerOptions(options: prompts.FindChoicesOptions): this {
        Object.assign(this.prompt.recognizerOptions, options);        
        return this;
    }

    /**
     * Sets the style of the choice list rendered to the user when prompting.
     * @param listStyle Type of list to render to to user. Defaults to `ListStyle.auto`.
     */
    public style(listStyle: prompts.ListStyle): this {
        this.prompt.style = listStyle;
        return this;
    }
    
    protected onPrompt(dc: DialogContext<C>, options: ChoicePromptOptions, isRetry: boolean): Promise<void> {
        const choices = options.choices;
        if (isRetry && options.retryPrompt) {
            return this.prompt.prompt(dc.context, choices, options.retryPrompt, options.retrySpeak);
        }
        return this.prompt.prompt(dc.context, choices, options.prompt, options.speak);
    }

    protected onRecognize(dc: DialogContext<C>, options: ChoicePromptOptions): Promise<O|undefined> {
        return this.prompt.recognize(dc.context, options.choices);
    }
}
