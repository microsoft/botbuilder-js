/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, Promiseable, InputHints } from 'botbuilder';
import { DialogSet } from '../dialogSet';

/** Basic configuration options supported by all prompts. */
export interface PromptOptions {
    /** (Optional) Initial prompt to send the user. */
    prompt?: string|Partial<Activity>;

    /** (Optional) Initial SSML to send the user. */
    speak?: string;

    /** (Optional) Retry prompt to send the user. */
    retryPrompt?: string|Partial<Activity>;

    /** (Optional) Retry SSML to send the user. */
    retrySpeak?: string;
}

/**
 * Signature of a function that can be passed in to the constructor of all prompts. This function 
 * will be called every time the user replies to a prompt and can be used to add additional 
 * validation logic to a prompt or to customize the reply sent when the user send a reply that isn't
 * recognized.
 * @param T Possible types for `value` arg.
 * @param PromptValidator.context Context object for the current turn of conversation with the user.
 * @param PromptValidator.value The value that was recognized or wasn't recognized. Depending on the prompt this can be either undefined or an empty array to indicate an unrecognized value.
 * @param PromptValidator.dialogs The parent dialog set.
 */
export type PromptValidator<T> = (context: BotContext, value: T, dialogs: DialogSet) => Promiseable<void>;

/**
 * Helper function to properly format a prompt sent to a user.
 * 
 * **Example usage:**
 * 
 * ```JavaScript
 * const { formatPrompt } = require('botbuilder-dialogs');
 *  
 * context.reply(formatPrompt(`Hi... What's your name?`, `What is your name?`));
 * ```
 * @param prompt Activity or text to prompt the user with.  If prompt is a `string` then an activity of type `message` will be created.
 * @param speak (Optional) SSML to speak to the user on channels like Cortana. The messages `inputHint` will be automatically set to `InputHints.expectingInput`.
 */
export function formatPrompt(prompt: string|Partial<Activity>, speak?: string): Partial<Activity> {
    const p = typeof prompt === 'string' ? { type: 'message', text: prompt } as Partial<Activity> : prompt;
    if (speak) { p.speak = speak }
    if (!p.inputHint) { p.inputHint = InputHints.ExpectingInput }
    return p;
}
