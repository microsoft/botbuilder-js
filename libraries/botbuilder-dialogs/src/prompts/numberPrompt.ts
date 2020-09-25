/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as Recognizers from '@microsoft/recognizers-text-number';
import { Activity, InputHints, TurnContext } from 'botbuilder-core';
import { Prompt, PromptOptions, PromptRecognizerResult, PromptValidator } from './prompt';

import { Chinese, Dutch, English, French, German, Japanese, LikelySubtags, NumberingSystem, Portuguese, Spanish } from "../i18n";

import * as Globalize from 'globalize';
Globalize.load(
    Chinese, English, Dutch, French, German, Japanese, LikelySubtags, NumberingSystem, Portuguese, Spanish    
);

/**
 * Prompts a user to enter a number.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `number` representing the users input.
 */
export class NumberPrompt extends Prompt<number> {

    /**
     * The prompts default locale that should be recognized.
     */
    public defaultLocale: string|undefined;

    /**
     * Creates a new NumberPrompt instance.
     * @param dialogId Unique ID of the dialog within its parent `DialogSet` or `ComponentDialog`.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     * @param defaultLocale (Optional) locale to use if `TurnContext.activity.locale` is not specified. Defaults to a value of `en-us`.
     */
    constructor(dialogId: string, validator?: PromptValidator<number>, defaultLocale?: string) {
        super(dialogId, validator);
        this.defaultLocale = defaultLocale;
    }

    /**
     * Prompts the user for input.
     * @param context Context for the current turn of conversation with the user.
     * @param state Contains state for the current instance of the prompt on the dialog stack.
     * @param options A prompt options object constructed from the options initially provided
     * in the call to Prompt.
     * @param isRetry `true` if this is the first time this prompt dialog instance
     * on the stack is prompting the user for input; otherwise, false.
     * @returns A Promise representing the asynchronous operation.
     */
    protected async onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void> {
        if (isRetry && options.retryPrompt) {
            await context.sendActivity(options.retryPrompt, undefined, InputHints.ExpectingInput);
        } else if (options.prompt) {
            await context.sendActivity(options.prompt, undefined, InputHints.ExpectingInput);
        }
    }

    /**
     * Attempts to recognize the user's input.
     * @param context Context for the current turn of conversation with the user.
     * @param state Contains state for the current instance of the prompt on the dialog stack.
     * @param options A prompt options object constructed from the options initially provided
     * in the call to Prompt.
     * @returns A Promise representing the asynchronous operation.
     */
    protected async onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<number>> {
        const result: PromptRecognizerResult<number> = { succeeded: false };
        const activity: Activity = context.activity;
        const utterance: string = activity.text;
        if (!utterance) {
            return result;
        }
        const locale: string = activity.locale || this.defaultLocale || 'en-us';
        const results: any = Recognizers.recognizeNumber(utterance, locale);
        if (results.length > 0 && results[0].resolution) {
            result.succeeded = true;

            const culture = this.getCultureFormattedForGlobalize(locale);
            const parser = Globalize(culture).numberParser();
            result.value = parser(results[0].resolution.value);
        }

        return result;
    }

    /**
     * @private 
     */
    private getCultureFormattedForGlobalize(culture: string) {
        // The portions of the Globalize parsing library we use
        // only need the first 2 letters for internationalization culture
        const formattedCulture = culture.replace(
            culture,
            `${culture[0]}${culture[1]}`
        );
        
        return formattedCulture.toLowerCase();
    }
}
