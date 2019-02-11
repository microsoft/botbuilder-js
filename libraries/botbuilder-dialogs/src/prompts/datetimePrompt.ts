/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as Recognizers from '@microsoft/recognizers-text-date-time';
import { Activity, InputHints, TurnContext } from 'botbuilder-core';
import { Prompt, PromptOptions, PromptRecognizerResult, PromptValidator, PromptValidatorContext, PromptConfiguration } from './prompt';

/**
 * Result returned by the `DateTimePrompt`.
 */
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
 * By default the prompt will return to the calling dialog a `DateTimeResolution[]`.
 */
export class DateTimePrompt extends Prompt<DateTimeResolution[]> {

    /**
     * The prompts default locale that should be recognized.
     */
    public defaultLocale: string|undefined;

    /**
     * Creates a new DateTimePrompt instance.
     * @param dialogId (Optional) unique ID of the dialog within its parent `DialogSet` or `ComponentDialog`.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     * @param defaultLocale (Optional) locale to use if `TurnContext.activity.locale` is not specified. Defaults to a value of `en-us`.
     */
    constructor(dialogId?: string, validator?: PromptValidator<DateTimeResolution[]>, defaultLocale?: string) {
        super(dialogId, validator || defaultValidator);
        this.defaultLocale = defaultLocale;
    }

    protected onComputeID(): string {
        return `datetimePrompt[${this.bindingPath()}]`;
    }
    
    protected async onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void> {
        if (isRetry && options.retryPrompt) {
            await context.sendActivity(options.retryPrompt, undefined, InputHints.ExpectingInput);
        } else if (options.prompt) {
            await context.sendActivity(options.prompt, undefined, InputHints.ExpectingInput);
        }
    }

    protected async onRecognize(
        context: TurnContext,
        state: any,
        options: PromptOptions
    ): Promise<PromptRecognizerResult<DateTimeResolution[]>> {
        const result: PromptRecognizerResult<DateTimeResolution[]> = { succeeded: false };
        const activity: Activity = context.activity;
        const utterance: string = activity.text;
        const locale: string =  activity.locale || this.defaultLocale || 'en-us';
        const results: any[] = Recognizers.recognizeDateTime(utterance, locale);
        if (results.length > 0 && results[0].resolution) {
            result.succeeded = true;
            result.value = results[0].resolution.values;
        }

        return result;
    }

    public static create(config?: PromptConfiguration): DateTimePrompt {
        const dialog = new DateTimePrompt();
        if (config) {
            Prompt.configure(dialog, config);
        }
        return dialog;
    }
}

async function defaultValidator(prompt: PromptValidatorContext<DateTimeResolution[]>): Promise<boolean> {
    if (prompt.preValidation) {
        const results = prompt.recognized.value;
        if (Array.isArray(results) && results.length > 0) {
            if (typeof results[0] === 'object' && results[0].timex) {
                return true;
            }
        }

        return false;
    } else {
        return prompt.recognized.succeeded;
    }
}