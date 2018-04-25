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

/**
 * :package: **botbuilder-dialogs**
 * 
 * Prompts a user to confirm something with a yes/no response. By default the prompt will return 
 * to the calling dialog a `boolean` representing the users selection.
 * 
 * The prompt can be used either as a dialog added to your bots `DialogSet` or on its own as a
 * control if your bot is using some other conversation management system.
 * 
 * ### Dialog Usage
 * 
 * When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named
 * dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either
 * `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted to answer a 
 * `yes/no` or `true/false` question and the users response will be passed as an argument to the 
 * callers next waterfall step: 
 * 
 * ```JavaScript
 * const { DialogSet, ConfirmPrompt } = require('botbuilder-dialogs');
 * 
 * const dialogs = new DialogSet();
 * 
 * dialogs.add('confirmPrompt', new ConfirmPrompt());
 * 
 * dialogs.add('confirmCancel', [
 *      async function (dc) {
 *          return dc.prompt('confirmPrompt', `This will cancel your order. Are you sure?`);
 *      },
 *      async function (dc, cancel) {
 *          if (cancel) {
 *              await dc.context.sendActivity(`Order cancelled.`);
 *          }
 *          return dc.end();
 *      }
 * ]);
 * ```
 * 
 * If the users response to the prompt fails to be recognized they will be automatically re-prompted
 * to try again. By default the original prompt is re-sent to the user but you can provide an 
 * alternate prompt to send by passing in additional options:
 * 
 * ```JavaScript
 * return dc.prompt('confirmPrompt', `This will cancel your order. Are you sure?`, { retryPrompt: `Please answer "yes" or "no".` });
 * ```
 * 
 * The prompts retry logic can also be completely customized by passing the prompts constructor a 
 * custom validator:
 * 
 * ```JavaScript
 * dialogs.add('confirmPrompt', new ConfirmPrompt(async (context, value) => {
 *    if (typeof confirmed != 'boolean') {
 *       await context.sendActivity(`Please answer "yes" or "no".`);
 *    }
 *    return confirmed; 
 * }));
 * ```
 * 
 * ### Control Usage
 * 
 * If your bot isn't dialog based you can still use the prompt on its own as a control. You will 
 * just need start the prompt from somewhere within your bots logic by calling the prompts 
 * `begin()` method:
 * 
 * ```JavaScript
 * const state = {};
 * const prompt = new ConfirmPrompt();
 * await prompt.begin(context, state, {
 *     prompt: `This will cancel your order. Are you sure?`,
 *     retryPrompt: `Please answer "yes" or "no".`
 * });
 * ```
 * 
 * The prompt will populate the `state` object you passed in with information it needs to process
 * the users response. You should save this off to your bots conversation state as you'll need to
 * pass it to the prompts `continue()` method on the next turn of conversation with the user:
 * 
 * ```JavaScript
 * const prompt = new ConfirmPrompt();
 * const result = await prompt.continue(context, state);
 * if (!result.active) {
 *     const cancelOrder = result.result;
 * }
 * ```
 * 
 * The `continue()` method returns a `DialogResult` object which can be used to determine when 
 * the prompt is finished and then to access the results of the prompt.  To interrupt or cancel
 * the prompt simply delete the `state` object your bot is persisting.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param O (Optional) output type returned by prompt. This defaults to a boolean `true` or `false` but can be changed by a custom validator passed to the prompt.
 */
export class ConfirmPrompt<C extends TurnContext, O = boolean> extends Prompt<C> {
    private prompt: prompts.ConfirmPrompt<O>;

    /** 
     * Allows for the localization of the confirm prompts yes/no choices to other locales besides 
     * english. The key of each entry is the languages locale code and should be lower cased. A
     * default fallback set of choices can be specified using a key of '*'. 
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * const confirmPrompt = new ConfirmPrompt();
     * 
     * // Configure yes/no choices for english and spanish (default)
     * confirmPrompt.choices['*'] = ['sí', 'no'];
     * confirmPrompt.choices['es'] = ['sí', 'no'];
     * confirmPrompt.choices['en-us'] = ['yes', 'no'];
     * 
     * // Add to dialogs
     * dialogs.add('confirmPrompt', confirmPrompt);
     * ```
     */
    static choices: prompts.ConfirmChoices = { '*': ['yes', 'no'] };

    /**
     * Creates a new `ConfirmPrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.  
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(validator?: PromptValidator<boolean, O>, defaultLocale?: string) {
        super(validator);
        this.prompt = prompts.createConfirmPrompt(undefined, defaultLocale);
        this.prompt.choices = ConfirmPrompt.choices;
    }

    /**
     * Sets additional options passed to the `ChoiceFactory` and used to tweak the style of choices 
     * rendered to the user. 
     * @param options Additional options to set. Defaults to `{ includeNumbers: false }`
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

    protected onRecognize(dc: DialogContext<C>, options: PromptOptions): Promise<O|undefined> {
        return this.prompt.recognize(dc.context);
    }
}
