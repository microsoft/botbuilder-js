/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity } from 'botbuilder';
import { PromptValidator } from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { Dialog } from '../dialog';
/**
 * Basic configuration options supported by all prompts.
 */
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
 * Base class for all prompts.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 */
export declare abstract class Prompt<C extends TurnContext> extends Dialog<C> {
    private validator;
    constructor(validator?: PromptValidator<any, any>);
    protected abstract onPrompt(dc: DialogContext<C>, options: PromptOptions, isRetry: boolean): Promise<any>;
    protected abstract onRecognize(dc: DialogContext<C>, options: PromptOptions): Promise<any | undefined>;
    dialogBegin(dc: DialogContext<C>, options: PromptOptions): Promise<any>;
    dialogContinue(dc: DialogContext<C>): Promise<any>;
}
