/**
 * @module botbuilder-prompts
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, TurnContext } from 'botbuilder';
import { PromptValidator } from './textPrompt';
/**
 * :package: **botbuilder-prompts**
 *
 * Datetime result returned by `DatetimePrompt`. For more details see the LUIS docs for
 * [builtin.datetimev2](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-reference-prebuilt-entities#builtindatetimev2).
 */
export interface FoundDatetime {
    /**
     * TIMEX expression representing ambiguity of the recognized time.
     */
    timex: string;
    /**
     * Type of time recognized. Possible values are 'date', 'time', 'datetime', 'daterange',
     * 'timerange', 'datetimerange', 'duration', or 'set'.
     */
    type: string;
    /**
     * Value of the specified [type](#type) that's a reasonable approximation given the ambiguity
     * of the [timex](#timex).
     */
    value: string;
}
/**
 * :package: **botbuilder-prompts**
 *
 * Prompts the user to reply with a date and/or time using natural language utterances like
 * "tomorrow at 9am".
 *
 * @remarks
 * This example shows creating a datetime prompt:
 *
 * ```JavaScript
 * const { createDatetimePrompt } = require('botbuilder-prompts');
 *
 * const timePrompt = createDatetimePrompt();
 * ```
 * @param O (Optional) type of result returned by the [recognize()](#recognize) method. This defaults to an instance of `FoundDateTime[]` but can be changed by the prompts custom validator.
 */
export interface DatetimePrompt<O = FoundDatetime[]> {
    /**
     * Sends a formated prompt to the user.
     *
     * @remarks
     * This example shows prompting the user for a time.
     *
     * ```JavaScript
     * await timePrompt.prompt(context, `What time should I set your alarm for?`);
     * ```
     * @param context Context for the current turn of conversation.
     * @param prompt Text or activity to send as the prompt.
     * @param speak (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`.
     */
    prompt(context: TurnContext, prompt: string | Partial<Activity>, speak?: string): Promise<void>;
    /**
     * Recognizes and validates the users reply.
     *
     * @remarks
     * The result of the call will either be the recognized value or `undefined`.
     *
     * The recognize() method will not automatically re-prompt the user so either the caller or the
     * prompts custom validator will need to implement re-prompting logic.
     *
     * ```JavaScript
     * const values = await timePrompt.recognize(context);
     * if (values && values.length > 0) {
     *    const time = values[0];
     *    switch (time.type) {
     *       case 'date':
     *       case 'time':
     *       case 'datetime':
     *          const date = new Date(time.value);
     *          break;
     *    }
     * }
     * ```
     * @param context Context for the current turn of conversation.
     */
    recognize(context: TurnContext): Promise<O | undefined>;
}
/**
 * Creates a new prompt that asks the user to reply with a date or time.
 *
 * @remarks
 * This example shows creating a datetime prompt with a custom validator that constrains the users
 * answer to a time thats in the future:
 *
 * ```JavaScript
 * const { createDatetimePrompt } = require('botbuilder-prompts');
 *
 * const timePrompt = createDatetimePrompt(async (context, values) => {
 *    try {
 *       if (!Array.isArray(values) || values.length < 0) { throw new Error('missing time') }
 *       if (values[0].type !== 'datetime') { throw new Error('unsupported type') }
 *       const value = new Date(values[0].value);
 *       if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
 *       return value;
 *    } catch (err) {
 *       await timePrompt.prompt(context, `Answer with a time in the future like "tomorrow at 9am" or say "cancel".`);
 *       return undefined;
 *    }
 * });
 * ```
 * @param O (Optional) type of result returned by the `recognize()` method. This defaults to an instance of `FoundDateTime` but can be changed by the prompts custom validator.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 * @param defaultLocale (Optional) locale to use if `context.activity.locale` not specified. Defaults to a value of `en-us`.
 */
export declare function createDatetimePrompt<O = FoundDatetime[]>(validator?: PromptValidator<FoundDatetime[], O>, defaultLocale?: string): DatetimePrompt<O>;
