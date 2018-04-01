/**
 * @module botbuilder-prompts
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Promiseable, Activity, TurnContext } from 'botbuilder';
import { PromptValidator } from './textPrompt';
import { sendPrompt } from './internal';
import * as Recognizers from '@microsoft/recognizers-text-number';

/** Prompts the user to reply with a number. */
export interface NumberPrompt<O = number> {
    /**
     * Sends a formated prompt to the user. 
     * @param context Context for the current turn of conversation.
     * @param prompt Text or activity to send as the prompt.
     * @param speak (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`.
     */
    prompt(context: TurnContext, prompt: string|Partial<Activity>, speak?: string): Promise<void>;

    /**
     * Recognizes and validates the users reply.
     * @param context Context for the current turn of conversation.
     */
    recognize(context: TurnContext): Promise<O|undefined>;
}

/**
 * Creates a new prompt that asks the user to reply with a number.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 * @param defaultLocale (Optional) locale to use if `context.activity.locale` not specified. Defaults to a value of `en-us`.
 */
export function createNumberPrompt<O = number>(validator?: PromptValidator<number, O>, defaultLocale?: string): NumberPrompt<O> {
    return {
        prompt: function prompt(context, prompt, speak) {
            return sendPrompt(context, prompt, speak);
        },
        recognize: function recognize(context) {
            const request = context.activity || {};
            const utterance = request.text || '';
            const locale =  request.locale || defaultLocale || 'en-us';
            const results = Recognizers.recognizeNumber(utterance, locale);
            const value = results.length > 0 && results[0].resolution ? parseFloat(results[0].resolution.value) : undefined;
            return Promise.resolve(validator ? validator(context, value) : value as any);
        }
    };
}
