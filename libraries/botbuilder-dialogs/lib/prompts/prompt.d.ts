/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity, Promiseable } from 'botbuilder';
import { DialogContext } from '../dialogContext';
import { Control } from '../control';
/** Basic configuration options supported by all prompts. */
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
/**
 * Signature of a function that can be passed in to the constructor of all prompts. This function
 * will be called every time the user replies to a prompt and can be used to add additional
 * validation logic to a prompt or to customize the reply sent when the user send a reply that isn't
 * recognized.
 * @param C Type of dialog context object passed to validator.
 * @param R Type of value that will recognized and passed to the validator as input.
 * @param O Type of output that will be returned by the validator. This can be changed from the input type by the validator.
 * @param PromptValidator.context Dialog context for the current turn of conversation with the user.
 * @param PromptValidator.value The value that was recognized or wasn't recognized. Depending on the prompt this can be either undefined or an empty array to indicate an unrecognized value.
 */
export declare type PromptValidator<C extends TurnContext, R> = (dc: DialogContext<C>, value: R | undefined) => Promiseable<any>;
export declare abstract class Prompt<C extends TurnContext, T> extends Control<C> {
    private validator;
    constructor(validator?: PromptValidator<C, T>);
    protected abstract onPrompt(dc: DialogContext<C>, options: PromptOptions, isRetry: boolean): Promise<any>;
    protected abstract onRecognize(dc: DialogContext<C>, options: PromptOptions): Promise<T | undefined>;
    dialogBegin(dc: DialogContext<C>, options: PromptOptions): Promise<any>;
    dialogContinue(dc: DialogContext<C>): Promise<any>;
}
