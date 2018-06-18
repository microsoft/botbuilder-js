/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity, Promiseable, ActivityTypes } from 'botbuilder';
import { PromptValidator } from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { Dialog } from '../dialog';

/** 
 * Basic configuration options supported by all prompts. 
 */
export interface PromptOptions {
    /** (Optional) Initial prompt to send the user. */
    prompt?: string|Partial<Activity>;

    /** (Optional) Initial SSML to send the user. */
    speak?: string;

    /** (Optional) Retry prompt to send the user. */
    retryPrompt?: string|Partial<Activity>;

    /** (Optional) Retry SSML to send the user. */
    retrySpeak?: string;
}

/**
 * Base class for all prompts.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 */
export abstract class Prompt<C extends TurnContext> extends Dialog<C> {
    constructor(private validator?: PromptValidator<any, any>) { 
        super();
    }

    protected abstract onPrompt(dc: DialogContext<C>, options: PromptOptions, isRetry: boolean): Promise<any>;

    protected abstract onRecognize(dc: DialogContext<C>, options: PromptOptions): Promise<any|undefined>;

    public dialogBegin(dc: DialogContext<C>, options: PromptOptions): Promise<any> {
        // Persist options
        const instance = dc.activeDialog;
        instance.state = options || {};

        // Send initial prompt
        return this.onPrompt(dc, instance.state, false);
    }

    public dialogContinue(dc: DialogContext<C>): Promise<any> {
        // Don't do anything for non-message activities
        if (dc.context.activity.type !== ActivityTypes.Message) {
            return Promise.resolve();
        }

        // Recognize value
        const instance = dc.activeDialog;
        return this.onRecognize(dc, instance.state)
            .then((recognized) => {
                if (this.validator) {
                    // Call validator
                    return Promise.resolve(this.validator(dc.context, recognized));
                } else {
                    // Pass through recognized value
                    return recognized;
                }
            }).then((output) => {
                if (output !== undefined) {
                    // Return recognized value
                    return dc.end(output);
                } else if (!dc.context.responded) {
                    // Send retry prompt
                    return this.onPrompt(dc, instance.state, true);
                }
            });
    }
}
