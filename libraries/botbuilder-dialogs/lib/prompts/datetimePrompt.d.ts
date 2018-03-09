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
 * Prompts a user to enter a datetime expression. By default the prompt will return to the
 * calling dialog a `FoundDatetime[]` but this can be overridden using a custom `PromptValidator`.
 *
 * **Example usage:**
 *
 * ```JavaScript
 * const { DialogSet, DatetimePrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('datetimePrompt', new DatetimePrompt());
 *
 * dialogs.add('datetimeDemo', [
 *      function (dc) {
 *          return dc.prompt('datetimePrompt', `datetime: enter a datetime`);
 *      },
 *      function (dc, values) {
 *          dc.batch.reply(`Recognized values: ${JSON.stringify(values)}`);
 *          return dc.end();
 *      }
 * ]);
 * ```
 */
export declare class DatetimePrompt<C extends BotContext> extends Prompt<C, prompts.FoundDatetime[]> {
    private prompt;
    /**
     * Creates a new instance of the prompt.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * dialogs.add('timePrompt', new DatetimePrompt((dc, values) => {
     *      try {
     *          if (!Array.isArray(values) || values.length < 0) { throw new Error('missing time') }
     *          if (values[0].type !== 'datetime') { throw new Error('unsupported type') }
     *          const value = new Date(values[0].value);
     *          if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
     *          return value;
     *      } catch (err) {
     *          dc.batch.reply(`Invalid time. Answer with a time in the future like "tomorrow at 9am" or say "cancel".`);
     *          return undefined;
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     * @param defaultLocale (Optional) locale to use if `dc.context.request.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(validator?: PromptValidator<C, prompts.FoundDatetime[]>, defaultLocale?: string);
    protected onPrompt(dc: DialogContext<C>, options: PromptOptions, isRetry: boolean): Promise<void>;
    protected onRecognize(dc: DialogContext<C>, options: PromptOptions): Promise<prompts.FoundDatetime[] | undefined>;
}
