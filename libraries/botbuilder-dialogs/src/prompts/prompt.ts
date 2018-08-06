/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity, ActivityTypes, InputHints } from 'botbuilder';
import { Choice } from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { Dialog, DialogTurnResult, DialogInstance, DialogReason } from '../dialog';

/** 
 * Basic configuration options supported by all prompts. 
 */
export interface PromptOptions {
    /** 
     * (Optional) Initial prompt to send the user. 
     */
    prompt?: string|Partial<Activity>;

    /** 
     * (Optional) Retry prompt to send the user. 
     */
    retryPrompt?: string|Partial<Activity>;

    /** 
     * (Optional) List of choices associated with the prompt. 
     */
    choices?: (string|Choice)[];

    /** 
     * (Optional) Additional validation rules to pass the prompts validator routine. 
     s*/
    validations?: object;
}

export interface PromptRecognizerResult<T> {
    succeeded: boolean;
    value?: T;
}

export type PromptValidator<T> = (context: TurnContext, prompt: PromptValidatorContext<T>) => Promise<void>;

export interface PromptValidatorContext<T> {
    recognized?: PromptRecognizerResult<T>;
    state: object;
    options: PromptOptions;
    end(result: any): void;
}


/**
 * Base class for all prompts.
 */
export abstract class Prompt<T> extends Dialog {
    constructor(dialogId: string, private validator?: PromptValidator<T>) { 
        super(dialogId);
    }

    protected abstract onPrompt(context: TurnContext, state: object, options: PromptOptions, isRetry: boolean): Promise<void>;

    protected abstract onRecognize(context: TurnContext, state: object, options: PromptOptions): Promise<PromptRecognizerResult<T>>;

    public async dialogBegin(dc: DialogContext, options: PromptOptions): Promise<DialogTurnResult> {
        // Ensure prompts have input hint set
        const opt = Object.assign({}, options);
        if (opt.prompt && typeof opt.prompt === 'object' && typeof opt.prompt.inputHint !== 'string') {
            opt.prompt.inputHint = InputHints.ExpectingInput;
        }
        if (opt.retryPrompt && typeof opt.retryPrompt === 'object' && typeof opt.retryPrompt.inputHint !== 'string') {
            opt.retryPrompt.inputHint = InputHints.ExpectingInput;
        }

        // Initialize prompt state
        const state = dc.activeDialog.state as PromptState;
        state.options = opt;
        state.state = {};

        // Send initial prompt
        await this.onPrompt(dc.context, state.state, state.options, false);
        return Dialog.EndOfTurn;
    }

    public async dialogContinue(dc: DialogContext): Promise<DialogTurnResult> {
        // Don't do anything for non-message activities
        if (dc.context.activity.type !== ActivityTypes.Message) {
            return Dialog.EndOfTurn;
        }

        // Perform base recognition
        const state = dc.activeDialog.state as PromptState;
        const recognized = await this.onRecognize(dc.context, state.state, state.options);
        
        // Validate the return value
        let end = false;
        let endResult: any;
        if (this.validator) {
            await this.validator(dc.context, {
                recognized: recognized,
                state: state.state,
                options: state.options,
                end: (output: any) => {
                    if (end) { throw new Error(`PromptValidatorContext.end(): method already called for the turn.`) }
                    end = true;
                    endResult = output;
                }
            });
        } else if (recognized.succeeded) {
            end = true;
            endResult = recognized.value;
        }

        // Return recognized value or re-prompt
        if (end) {
            return await dc.end(endResult);
        } else {
            if (!dc.context.responded) {
                await this.onPrompt(dc.context, state.state, state.options, true);
            }  
            return Dialog.EndOfTurn;
        }
    }

    public async dialogResume(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // Prompts are typically leaf nodes on the stack but the dev is free to push other dialogs
        // on top of the stack which will result in the prompt receiving an unexpected call to
        // dialogResume() when the pushed on dialog ends. 
        // To avoid the prompt prematurely ending we need to implement this method and 
        // simply re-prompt the user.
        await this.dialogReprompt(dc.context, dc.activeDialog);
        return Dialog.EndOfTurn;
    }

    public async dialogReprompt(context: TurnContext, instance: DialogInstance): Promise<void> {
        const state = instance.state as PromptState;
        await this.onPrompt(context, state.state, state.options, true);
    }
}

interface PromptState {
    state: object;
    options: PromptOptions;
}