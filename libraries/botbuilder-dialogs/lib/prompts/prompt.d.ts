/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity } from 'botbuilder-core';
import { Choice, ChoiceFactoryOptions } from '../choices';
import { DialogContext } from '../dialogContext';
import { Dialog, DialogTurnResult, DialogInstance, DialogReason } from '../dialog';
/**
 * Controls the way that choices for a `ChoicePrompt` or yes/no options for a `ConfirmPrompt` are
 * presented to a user.
 */
export declare enum ListStyle {
    /** Don't include any choices for prompt. */
    none = 0,
    /** Automatically select the appropriate style for the current channel. */
    auto = 1,
    /** Add choices to prompt as an inline list. */
    inline = 2,
    /** Add choices to prompt as a numbered list. */
    list = 3,
    /** Add choices to prompt as suggested actions. */
    suggestedAction = 4,
}
/**
 * Basic configuration options supported by all prompts.
 */
export interface PromptOptions {
    /**
     * (Optional) Initial prompt to send the user.
     */
    prompt?: string | Partial<Activity>;
    /**
     * (Optional) Retry prompt to send the user.
     */
    retryPrompt?: string | Partial<Activity>;
    /**
     * (Optional) List of choices associated with the prompt.
     */
    choices?: (string | Choice)[];
    /**
     * (Optional) Additional validation rules to pass the prompts validator routine.
     s*/
    validations?: object;
}
export interface PromptRecognizerResult<T> {
    succeeded: boolean;
    value?: T;
}
export declare type PromptValidator<T> = (context: TurnContext, prompt: PromptValidatorContext<T>) => Promise<void>;
export interface PromptValidatorContext<T> {
    recognized: PromptRecognizerResult<T>;
    state: object;
    options: PromptOptions;
    end(result: any): void;
}
/**
 * Base class for all prompts.
 */
export declare abstract class Prompt<T> extends Dialog {
    private validator;
    constructor(dialogId: string, validator?: PromptValidator<T>);
    protected abstract onPrompt(context: TurnContext, state: object, options: PromptOptions, isRetry: boolean): Promise<void>;
    protected abstract onRecognize(context: TurnContext, state: object, options: PromptOptions): Promise<PromptRecognizerResult<T>>;
    dialogBegin(dc: DialogContext, options: PromptOptions): Promise<DialogTurnResult>;
    dialogContinue(dc: DialogContext): Promise<DialogTurnResult>;
    dialogResume(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult>;
    dialogReprompt(context: TurnContext, instance: DialogInstance): Promise<void>;
    protected appendChoices(prompt: string | Partial<Activity>, channelId: string, choices: (string | Choice)[], style: ListStyle, options?: ChoiceFactoryOptions): Partial<Activity>;
}
