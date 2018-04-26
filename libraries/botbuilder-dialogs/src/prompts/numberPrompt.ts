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
 * Prompts a user to enter a number. By default the prompt will return to the calling dialog 
 * a `number` representing the users input.
 * 
 * The prompt can be used either as a dialog added to your bots `DialogSet` or on its own as a
 * control if your bot is using some other conversation management system.
 * 
 * ### Dialog Usage
 * 
 * When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named
 * dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either
 * `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted to reply with a 
 * number which will be passed as an argument to the callers next waterfall step: 
 * 
 * ```JavaScript
 * const { DialogSet, NumberPrompt } = require('botbuilder-dialogs');
 * 
 * const dialogs = new DialogSet();
 * 
 * dialogs.add('agePrompt', new NumberPrompt());
 * 
 * dialogs.add('askAge', [
 *      async function (dc) {
 *          await dc.prompt('agePrompt', `How old are you?`);
 *      },
 *      async function (dc, age) {
 *          if (age < 40) {
 *              await dc.context.sendActivity(`So young :)`);
 *          } else {
 *              await dc.context.sendActivity(`I hear ${age} is the new ${age - 10} :)`);
 *          }
 *          await dc.end();
 *      }
 * ]);
 * ```
 * 
 * The prompt can be configured with a custom validator to perform additional checks like ensuring
 * that the user responds with a valid age and that only whole numbers are returned:
 * 
 * ```JavaScript
 * dialogs.add('agePrompt', new NumberPrompt(async (context, value) => {
 *    if (typeof value == 'number') {
 *       if (value >= 1 && value < 111) {
 *          // Return age rounded down to nearest whole number.
 *          return Math.floor(value);
 *       }
 *    }
 *    await context.sendActivity(`Please enter a number between 1 and 110 or say "cancel".`);
 *    return undefined;
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
 * const prompt = new NumberPrompt();
 * await prompt.begin(context, state, {
 *     prompt: `How old are you?`,
 *     retryPrompt: `Please reply with a valid number like "23".`
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
 *     const age = result.result;
 * }
 * ```
 * 
 * The `continue()` method returns a `DialogResult` object which can be used to determine when 
 * the prompt is finished and then to access the results of the prompt.  To interrupt or cancel
 * the prompt simply delete the `state` object your bot is persisting.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param O (Optional) output type returned by prompt. This defaults to a `number` but can be changed by a custom validator passed to the prompt.
 */
export class NumberPrompt<C extends TurnContext, O = number> extends Prompt<C> {
    private prompt: prompts.NumberPrompt<O>;

    /**
     * Creates a new `NumberPrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.  
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(validator?: PromptValidator<number, O>, defaultLocale?: string) {
        super(validator);
        this.prompt = prompts.createNumberPrompt(undefined, defaultLocale); 
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
