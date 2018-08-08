/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity } from 'botbuilder';
import { DialogContext } from '../dialogContext';
import { Dialog, DialogTurnResult, DialogInstance, DialogReason } from '../dialog';
import { PromptValidator, PromptOptions, PromptRecognizerResult } from './prompt';
/**
 * Base class for all prompts.
 */
export declare abstract class ActivityPrompt extends Dialog {
    private validator;
    constructor(dialogId: string, validator: PromptValidator<Activity>);
    protected onPrompt(context: TurnContext, state: object, options: PromptOptions): Promise<void>;
    protected onRecognize(context: TurnContext, state: object, options: PromptOptions): Promise<PromptRecognizerResult<Activity>>;
    dialogBegin(dc: DialogContext, options: PromptOptions): Promise<DialogTurnResult>;
    dialogContinue(dc: DialogContext): Promise<DialogTurnResult>;
    dialogResume(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult>;
    dialogReprompt(context: TurnContext, instance: DialogInstance): Promise<void>;
}
