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

/** 
 * Prompts the user to reply with a number. 
 *
 * @remarks
 * This example shows creating a number prompt:
 *
 * ```JavaScript
 * const { createNumberPrompt } = require('botbuilder-prompts');
 * 
 * const agePrompt = createNumberPrompt();
 * ```
 * @param O (Optional) type of result returned by the [recognize()](#recognize) method. This defaults to `number` but can be changed by the prompts custom validator.
 */
export interface NumberPrompt<O = number> {
    /**
     * Sends a formated prompt to the user.
     *
     * @remarks
     * This example shows prompting the user for their age:
     *
     * ```JavaScript
     * await agePrompt.prompt(context, `How old are you?`);
     * ```
     * @param context Context for the current turn of conversation.
     * @param prompt Text or activity to send as the prompt.
     * @param speak (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`.
     */
    prompt(context: TurnContext, prompt: string|Partial<Activity>, speak?: string): Promise<void>;

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
     * const age = await agePrompt.recognize(context);
     * if (typeof age == 'number') {
     *    // Save age and continue
     * }
     * ```
     * @param context Context for the current turn of conversation.
     */
    recognize(context: TurnContext): Promise<O|undefined>;
}

/**
 * Creates a new prompt that asks the user to reply with a number.
 *
 * @remarks
 * This example creates a number prompt with a custom validator that constrains the users answer to
 * a range of numbers and then rounds off any fractional replies: 
 *
 * ```JavaScript
 * const { createNumberPrompt } = require('botbuilder-prompts');
 * 
 * const agePrompt = createNumberPrompt(async (context, value) => {
 *    if (typeof value == 'number') {
 *       if (value >= 1 && value < 111) {
 *          // Return age rounded down to nearest whole number.
 *          return Math.floor(value);
 *       }
 *    }
 *    await agePrompt.prompt(context, `Please enter a number between 1 and 110 or say "cancel".`);
 *    return undefined;
 * });
 * ```
 * @param O (Optional) type of result returned by the `recognize()` method. This defaults to `number` but can be changed by the prompts custom validator.
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
