/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity } from 'botbuilder';
import { DialogContext } from '../dialogContext';
import { Dialog, DialogTurnResult } from '../dialog';
import * as prompts from 'botbuilder-prompts';
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
    choices?: (string | prompts.Choice)[];
}
/**
 * Base class for all prompts.
 */
export declare abstract class Prompt extends Dialog {
    private validator;
    constructor(validator?: prompts.PromptValidator<any, any>);
    protected abstract onPrompt(dc: DialogContext, options: PromptOptions, isRetry: boolean): Promise<DialogTurnResult>;
    protected abstract onRecognize(dc: DialogContext, options: PromptOptions): Promise<any | undefined>;
    dialogBegin(dc: DialogContext, options: PromptOptions): Promise<DialogTurnResult>;
    dialogContinue(dc: DialogContext): Promise<DialogTurnResult>;
}
