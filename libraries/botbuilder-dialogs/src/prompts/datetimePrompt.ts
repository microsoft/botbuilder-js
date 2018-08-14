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
 * Prompts a user to enter a datetime expression. 
 * 
 * @remarks
 * By default the prompt will return to the calling dialog a `FoundDatetime[]` but this can be 
 * overridden using a custom `PromptValidator`.
 * 
 * #### Prompt Usage
 * 
 * When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named
 * dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either
 * `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted to reply with a 
 * date and/or time. The recognized date/time will be passed as an argument to the callers next 
 * waterfall step: 
 * 
 * ```JavaScript
 * const { DialogSet, DatetimePrompt } = require('botbuilder-dialogs');
 * 
 * const dialogs = new DialogSet();
 * 
 * dialogs.add('datetimePrompt', new DatetimePrompt(AlarmTimeValidator));
 * 
 * dialogs.add('setAlarmTime', [
 *      async function (dc) {
 *          await dc.prompt('datetimePrompt', `What time should I set your alarm for?`);
 *      },
 *      async function (dc, time) {
 *          await dc.context.sendActivity(`Alarm time set`);
 *          await dc.end();
 *      }
 * ]);
 * 
 * async function AlarmTimeValidator(context, values) {
 *     try {
 *         if (!Array.isArray(values) || values.length < 0) { throw new Error('missing time') }
 *         if (values[0].type !== 'datetime') { throw new Error('unsupported type') }
 *         const value = new Date(values[0].value);
 *         if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
 *         return value;
 *     } catch (err) {
 *         await context.sendActivity(`Answer with a time in the future like "tomorrow at 9am" or say "cancel".`);
 *         return undefined;
 *     }
 * }
 * ```
 */
export class DatetimePrompt extends Prompt<prompts.FoundDatetime[]> {
    private prompt: prompts.DatetimePrompt;

    /**
     * Creates a new `DatetimePrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.  
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(dialogId: string, validator?: PromptValidator<prompts.FoundDatetime[]>, defaultLocale?: string) {
        super(dialogId, validator);
        this.prompt = prompts.createDatetimePrompt(undefined, defaultLocale); 
    }

    protected async onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void> {
        if (isRetry && options.retryPrompt) {
            await this.prompt.prompt(context, options.retryPrompt);
        } else if (options.prompt) {
            await this.prompt.prompt(context, options.prompt);
        }
    }

    protected async onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<prompts.FoundDatetime[]>> {
        const value = await this.prompt.recognize(context);
        return value !== undefined ? { succeeded: true, value: value } : { succeeded: false };
    }
}
