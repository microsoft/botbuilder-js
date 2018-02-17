/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, Promiseable } from 'botbuilder';
import { DialogSet } from '../dialogSet';
export interface PromptOptions {
    /** (Optional) Initial prompt to send the user. */
    prompt?: string | Partial<Activity>;
    /** (Optional) Initial SSML to send the user. */
    speak?: string;
    /** (Optional) Retry prompt to send the user. */
    retryPrompt?: string | Partial<Activity>;
    /** (Optional) Retry SSML to send the user. */
    retrySpeak?: string;
}
export declare type PromptValidator<T> = (context: BotContext, value: T, dialogs: DialogSet) => Promiseable<void>;
export declare function formatPrompt(prompt: string | Partial<Activity>, speak?: string): Partial<Activity>;
