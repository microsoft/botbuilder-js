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
import { Dialog, DialogTurnResult } from '../dialog';

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
    constructor(private validator?: PromptValidator<any, any>) { 
        super();
    }

    protected abstract onPrompt(dc: DialogContext, options: PromptOptions, isRetry: boolean): Promise<DialogTurnResult>;

    protected abstract onRecognize(dc: DialogContext, options: PromptOptions): Promise<any|undefined>;

    public async dialogBegin(dc: DialogContext, options: PromptOptions): Promise<DialogTurnResult> {
        // Initialize prompt state
        const state = dc.activeDialog.state as PromptState;
        state.state = {};
        state.options = Object.assign({}, options);

        // Send initial prompt
        return await this.onPrompt(dc, state.options, false);
    }

    public async dialogContinue(dc: DialogContext): Promise<DialogTurnResult> {
        // Don't do anything for non-message activities
        if (dc.context.activity.type === ActivityTypes.Message) {
            // Perform base recognition
            const state = dc.activeDialog.state as PromptState;
            const recognized = await this.onRecognize(dc, state.options);
            
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
            } else if (!dc.context.responded) {
                return await this.onPrompt(dc, state.options, true);
            } else {
                return Dialog.EndOfTurn;
            }
        }
    }
}

interface PromptState {
    state: object;
    options: PromptOptions;
}