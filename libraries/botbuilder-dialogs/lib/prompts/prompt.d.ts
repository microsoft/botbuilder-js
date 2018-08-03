/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity } from 'botbuilder';
import { Choice } from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { Dialog, DialogTurnResult, DialogInstance } from '../dialog';
/**
 * Basic configuration options supported by all prompts.
 */
export interface PromptOptions {
    /** Initial prompt to send the user. */
    prompt: string | Partial<Activity>;
    /** (Optional) Initial SSML to send the user. */
    speak?: string;
    /** (Optional) Retry prompt to send the user. */
    retryPrompt?: string | Partial<Activity>;
    /** (Optional) Retry SSML to send the user. */
    retrySpeak?: string;
    /** (Optional) List of choices associated with the prompt. */
    choices?: (string | Choice)[];
    /** (Optional) Additional validation rules to pass the prompts validator routine. */
    validations?: any;
}
export declare type PromptValidator<R, O = R> = (context: TurnContext, prompt: PromptValidatorContext<R, O>) => Promise<void>;
export interface PromptValidatorContext<R, O> {
    result?: R;
    state: object;
    options: PromptOptions;
    end(result: O): void;
}
/**
 * Base class for all prompts.
 */
export declare abstract class Prompt extends Dialog {
    private validator;
    constructor(dialogId: string, validator?: PromptValidator<any, any>);
    protected abstract onPrompt(context: TurnContext, state: object, options: PromptOptions, isRetry: boolean): Promise<void>;
    protected abstract onRecognize(context: TurnContext, state: object, options: PromptOptions): Promise<any | undefined>;
    dialogBegin(dc: DialogContext, options: PromptOptions): Promise<DialogTurnResult>;
    dialogContinue(dc: DialogContext): Promise<DialogTurnResult>;
    dialogReprompt(context: TurnContext, instance: DialogInstance): Promise<void>;
    dialogResume(dc: DialogContext, result?: any): Promise<DialogTurnResult>;
}
