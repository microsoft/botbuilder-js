/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, InputHints } from 'botbuilder-core';
import { Prompt, PromptOptions, PromptValidator, PromptRecognizerResult } from './prompt';
import * as Recognizers from '@microsoft/recognizers-text-number';

/**
 * Prompts a user to enter a number. 
 * 
 * @remarks
 * By default the prompt will return to the calling dialog a `number` representing the users input.
 */
export class NumberPrompt extends Prompt<number> {
    /**
     * Creates a new `NumberPrompt` instance.
     * @param dialogId Unique ID of the dialog within its parent `DialogSet`.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.  
     * @param defaultLocale (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`.
     */
    constructor(dialogId: string, validator?: PromptValidator<number>, defaultLocale?: string) {
        super(dialogId, validator);
        this.defaultLocale = defaultLocale;
    }

    public defaultLocale: string|undefined;

    protected async onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void> {
        if (isRetry && options.retryPrompt) {
            await context.sendActivity(options.retryPrompt, undefined, InputHints.ExpectingInput);
        } else if (options.prompt) {
            await context.sendActivity(options.prompt, undefined, InputHints.ExpectingInput);
        }
    }

    protected async onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<number>> {
        const result: PromptRecognizerResult<number> = { succeeded: false };
        const activity = context.activity;
        const utterance = activity.text;
        const locale =  activity.locale || this.defaultLocale || 'en-us';
        const results = Recognizers.recognizeNumber(utterance, locale);
        if (results.length > 0 && results[0].resolution) {
            result.succeeded = true;
            result.value = parseFloat(results[0].resolution.value);
        }
        return result;
    }
}
