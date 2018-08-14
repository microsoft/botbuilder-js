/**
 * @module botbuilder-prompts
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Promiseable, Activity, TurnContext } from 'botbuilder';
/**
 * Prompts the user to reply with some text.
 *
 * @remarks
 * This example shows creating a text prompt:
 *
 * ```JavaScript
 * const { createTextPrompt } = require('botbuilder-prompts');
 *
 * const agePrompt = createTextPrompt();
 * ```
 * @param O (Optional) type of result returned by the [recognize()](#recognize) method. This defaults to return a `string` but can be changed by the prompts custom validator.
 */
export interface TextPrompt<O = string> {
    /**
     * Sends a formated prompt to the user.
     *
     * @remarks
     * This example shows prompting the user for their name:
     *
     * ```JavaScript
     * await namePrompt.prompt(context, `What's your name?`);
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
     * const name = await namePrompt.recognize(context);
     * if (name) {
     *    // Save name and continue
     * }
     * ```
     * @param context Context for the current turn of conversation.
     */
    recognize(context: TurnContext): Promise<O | undefined>;
}
/**
 * Signature of a handler that can be passed to a prompt to provide additional validation logic
 * or to customize the reply sent to the user when their response is invalid.
 *
 * ```TypeScript
 * type PromptValidator<R, O = R> = (context: TurnContext, value: R|undefined) => Promiseable<O|undefined>;
 * ```
 * @param R Type of value that will recognized and passed to the validator as input.
 * @param O Type of output that will be returned by the validator. This can be changed from the input type by the validator.
 * @param PromptValidator.context Context for the current turn of conversation.
 * @param PromptValidator.value The value that was recognized or `undefined` if not recognized.
 */
export declare type PromptValidator<R, O = R> = (context: TurnContext, value: R | undefined) => Promiseable<O | undefined>;
/**
 * Creates a new prompt that asks the user to enter some text.
 *
 * @remarks
 * This example shows creating a text prompt with a custom validator that ensures the length of
 * the users answer matches some minimum length requirement:
 *
 * ```JavaScript
 * const { createTextPrompt } = require('botbuilder-prompts');
 *
 * const namePrompt = createTextPrompt(async (context, value) => {
 *    if (value && value.length >= 3) {
 *       return value;
 *    }
 *    await namePrompt.prompt(context, `Your entry must be at least 3 characters in length.`);
 *    return undefined;
 * });
 * ```
 * @param O (Optional) type of result returned by the `recognize()` method. This defaults to return a `string` but can be changed by the prompts custom validator.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 */
export declare function createTextPrompt<O = string>(validator?: PromptValidator<string, O>): TextPrompt<O>;
