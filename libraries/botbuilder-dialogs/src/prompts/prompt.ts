/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity, Promiseable } from 'botbuilder';
import { PromptValidator } from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { Control } from '../control';

/** Basic configuration options supported by all prompts. */
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

export abstract class Prompt<C extends TurnContext> extends Control<C> {
    constructor(private validator?: PromptValidator<any, any>) { 
        super();
    }

    protected abstract onPrompt(dc: DialogContext<C>, options: PromptOptions, isRetry: boolean): Promise<any>;

    protected abstract onRecognize(dc: DialogContext<C>, options: PromptOptions): Promise<any|undefined>;

    public dialogBegin(dc: DialogContext<C>, options: PromptOptions): Promise<any> {
        // Persist options
        const instance = dc.instance;
        instance.state = options || {};

        // Send initial prompt
        return this.onPrompt(dc, instance.state, false);
    }

    public dialogContinue(dc: DialogContext<C>): Promise<any> {
        // Recognize value
        const instance = dc.instance;
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
