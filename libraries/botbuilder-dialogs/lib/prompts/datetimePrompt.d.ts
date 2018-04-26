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
 * Prompts a user to enter a datetime expression. By default the prompt will return to the
 * calling dialog a `FoundDatetime[]` but this can be overridden using a custom `PromptValidator`.
 *
 * The prompt can be used either as a dialog added to your bots `DialogSet` or on its own as a
 * control if your bot is using some other conversation management system.
 *
 * ### Dialog Usage
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
 *
 * ### Control Usage
 *
 * If your bot isn't dialog based you can still use the prompt on its own as a control. You will
 * just need start the prompt from somewhere within your bots logic by calling the prompts
 * `begin()` method:
 *
 * ```JavaScript
 * const state = {};
 * const prompt = new DatetimePrompt(AlarmTimeValidator);
 * await prompt.begin(context, state, { prompt: `What time should I set your alarm for?` });
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
 *     const time = result.result;
 * }
 * ```
 *
 * The `continue()` method returns a `DialogResult` object which can be used to determine when
 * the prompt is finished and then to access the results of the prompt.  To interrupt or cancel
 * the prompt simply delete the `state` object your bot is persisting.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param O (Optional) output type returned by prompt. This defaults to a `FoundDatetime[]` but can be changed by a custom validator passed to the prompt.
 */
export declare class DatetimePrompt<C extends TurnContext, O = prompts.FoundDatetime[]> extends Prompt<C> {
    private prompt;
    /**
     * Creates a new `DatetimePrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(validator?: PromptValidator<prompts.FoundDatetime[], O>, defaultLocale?: string);
    protected onPrompt(dc: DialogContext<C>, options: PromptOptions, isRetry: boolean): Promise<void>;
    protected onRecognize(dc: DialogContext<C>, options: PromptOptions): Promise<O | undefined>;
}
