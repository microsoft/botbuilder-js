/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Prompt, PromptOptions, PromptValidator, PromptRecognizerResult } from './prompt';
export interface DateTimeResolution {
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
 * Prompts a user to enter a datetime expression.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `FoundDatetime[]` but this can be
 * overridden using a custom `PromptValidator`.
 */
export declare class DateTimePrompt extends Prompt<DateTimeResolution[]> {
    /**
     * Creates a new `DatetimePrompt` instance.
     * @param dialogId Unique ID of the dialog within its parent `DialogSet`.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(dialogId: string, validator?: PromptValidator<DateTimeResolution[]>, defaultLocale?: string);
    defaultLocale: string | undefined;
    protected onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void>;
    protected onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<DateTimeResolution[]>>;
}
