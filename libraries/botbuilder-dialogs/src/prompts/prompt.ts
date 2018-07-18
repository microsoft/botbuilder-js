/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes } from 'botbuilder';
import { DialogContext } from '../dialogContext';
import { Dialog, DialogTurnResult } from '../dialog';
import * as prompts from 'botbuilder-prompts';

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
    choices?: (string|prompts.Choice)[];
}

/**
 * Base class for all prompts.
 */
export abstract class Prompt extends Dialog {
    constructor(private validator?: prompts.PromptValidator<any, any>) { 
        super();
    }

    protected abstract onPrompt(dc: DialogContext, options: PromptOptions, isRetry: boolean): Promise<DialogTurnResult>;

    protected abstract onRecognize(dc: DialogContext, options: PromptOptions): Promise<any|undefined>;

    public async dialogBegin(dc: DialogContext, options: PromptOptions): Promise<DialogTurnResult> {
        // Persist options
        const instance = dc.activeDialog;
        instance.state = options || {};

        // Send initial prompt
        return await this.onPrompt(dc, instance.state, false);
    }

    public async dialogContinue(dc: DialogContext): Promise<DialogTurnResult> {
        // Don't do anything for non-message activities
        if (dc.context.activity.type === ActivityTypes.Message) {
            // Perform base recognition
            const options = dc.activeDialog.state as PromptOptions;
            let recognized = await this.onRecognize(dc, options);
            
            // Optionally call the configured validator
            if (this.validator) {
                recognized = await this.validator(dc.context, recognized);
            }

            // Return recognized value or re-prompt
            if (recognized !== undefined) {
                return await dc.end(recognized);
            } else if (!dc.context.responded) {
                return await this.onPrompt(dc, options, true);
            } else {
                return Dialog.EndOfTurn;
            }
        }
    }
}
