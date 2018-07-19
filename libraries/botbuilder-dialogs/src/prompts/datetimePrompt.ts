/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogTurnResult } from '../dialog';
import { DialogContext } from '../dialogContext';
import { Prompt, PromptOptions, PromptValidator } from './prompt';
import * as prompts from '../../../botbuilder-prompts/lib';

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
 * @param O (Optional) output type returned by prompt. This defaults to a `FoundDatetime[]` but can be changed by a custom validator passed to the prompt.
 */
export class DatetimePrompt<O = prompts.FoundDatetime[]> extends Prompt {
    private prompt: prompts.DatetimePrompt<O>;

    /**
     * Creates a new `DatetimePrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.  
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(dialogId: string, validator?: PromptValidator<prompts.FoundDatetime[], O>, defaultLocale?: string) {
        super(dialogId, validator);
        this.prompt = prompts.createDatetimePrompt(undefined, defaultLocale); 
    }

    protected async onPrompt(dc: DialogContext, options: PromptOptions, isRetry: boolean): Promise<DialogTurnResult> {
        if (isRetry && options.retryPrompt) {
            await this.prompt.prompt(dc.context, options.retryPrompt, options.retrySpeak);
        } else if (options.prompt) {
            await this.prompt.prompt(dc.context, options.prompt, options.speak);
        }
        return Dialog.EndOfTurn;
    }

    protected async onRecognize(dc: DialogContext, options: PromptOptions): Promise<O|undefined> {
        return await this.prompt.recognize(dc.context);
    }
}
