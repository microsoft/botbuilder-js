/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity, ActivityTypes } from 'botbuilder';
import { Choice } from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { Dialog, DialogTurnResult, DialogInstance } from '../dialog';

/** 
 * Basic configuration options supported by all prompts. 
 */
export interface PromptOptions {
    /** Initial prompt to send the user. */
    prompt: string|Partial<Activity>;

    /** (Optional) Initial SSML to send the user. */
    speak?: string;

    /** (Optional) Retry prompt to send the user. */
    retryPrompt?: string|Partial<Activity>;

    /** (Optional) Retry SSML to send the user. */
    retrySpeak?: string;

    /** (Optional) List of choices associated with the prompt. */
    choices?: (string|Choice)[];

    /** (Optional) Additional validation rules to pass the prompts validator routine. */
    validations?: any;
}

export type PromptValidator<R, O = R> = (context: TurnContext, prompt: PromptValidatorContext<R, O>) => Promise<void>;

export interface PromptValidatorContext<R, O> {
    result?: R;
    state: object;
    options: PromptOptions;
    end(result: O): void;
}


/**
 * Base class for all prompts.
 */
export abstract class Prompt extends Dialog {
    constructor(dialogId: string, private validator?: PromptValidator<any, any>) { 
        super(dialogId);
    }

    protected abstract onPrompt(context: TurnContext, state: object, options: PromptOptions, isRetry: boolean): Promise<void>;

    protected abstract onRecognize(context: TurnContext, state: object, options: PromptOptions): Promise<any|undefined>;

    public async dialogBegin(dc: DialogContext, options: PromptOptions): Promise<DialogTurnResult> {
        // Initialize prompt state
        const state = dc.activeDialog.state as PromptState;
        state.state = {};
        state.options = Object.assign({}, options);

        // Send initial prompt
        await this.onPrompt(dc.context, state.state, state.options, false);
        return Dialog.EndOfTurn;
    }

    public async dialogContinue(dc: DialogContext): Promise<DialogTurnResult> {
        // Don't do anything for non-message activities
        if (dc.context.activity.type === ActivityTypes.Message) {
            // Perform base recognition
            const state = dc.activeDialog.state as PromptState;
            const recognized = await this.onRecognize(dc.context, state.state, state.options);
            
            // Validate the return value
            let end = false;
            let endResult: any;
            if (this.validator) {
                await this.validator(dc.context, {
                    result: recognized,
                    state: state.state,
                    options: state.options,
                    end: (output: any) => {
                        end = true;
                        endResult = output;
                    }
                });
            } else if (recognized !== undefined) {
                end = true;
                endResult = recognized;
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
    }

    public async dialogReprompt(context: TurnContext, instance: DialogInstance): Promise<void> {
        const state = instance.state as PromptState;
        await this.onPrompt(context, state.state, state.options, true);
    }

    public async dialogResume(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        // Prompts are typically leaf nodes on the stack but the dev is free to push other dialogs
        // on top of the stack which will result in the prompt receiving an unexpected call to
        // dialogResume() when the pushed on dialog ends. 
        // To avoid the prompt prematurely ending we need to implement this method and 
        // simply re-prompt the user.
        await this.dialogReprompt(dc.context, dc.activeDialog);
        return Dialog.EndOfTurn;
    }
}

interface PromptState {
    state: object;
    options: PromptOptions;
}