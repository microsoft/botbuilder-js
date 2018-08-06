/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
import { Prompt, PromptOptions, PromptValidator, PromptRecognizerResult } from './prompt';
import * as prompts from 'botbuilder-prompts';

/**
 * Prompts a user to enter a number. 
 * 
 * @remarks
 * By default the prompt will return to the calling dialog a `number` representing the users input.
 * 
 * #### Prompt Usage
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
 */
export class NumberPrompt extends Prompt<number> {
    private prompt: prompts.NumberPrompt;

    /**
     * Creates a new `NumberPrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.  
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(dialogId: string, validator?: PromptValidator<number>, defaultLocale?: string) {
        super(dialogId, validator);
        this.prompt = prompts.createNumberPrompt(undefined, defaultLocale); 
    }

    protected async onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void> {
        if (isRetry && options.retryPrompt) {
            await this.prompt.prompt(context, options.retryPrompt);
        } else if (options.prompt) {
            await this.prompt.prompt(context, options.prompt);
        }
    }

    protected async onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<number>> {
        const value = await this.prompt.recognize(context);
        return value !== undefined ? { succeeded: true, value: value } : { succeeded: false };
    }
}
