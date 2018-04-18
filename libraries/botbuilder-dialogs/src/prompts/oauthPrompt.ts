/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity, Promiseable, ActivityTypes, InputHints } from 'botbuilder';
import * as prompts from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { Control } from '../control';
import { PromptOptions } from './prompt';

export interface OAuthPromptSettingsWithTimeout extends prompts.OAuthPromptSettings {
    /** 
     * (Optional) number of milliseconds the prompt will wait for the user to authenticate. 
     * Defaults to a value `54,000,000` (15 minutes.)
     */
    timeout?: number;
}

interface OAuthPromptState extends PromptOptions {
    /** Timestamp of when the prompt will timeout. */
    expires: number;
}

export class OAuthPrompt<C extends TurnContext> extends Control<C> {
    private prompt: prompts.OAuthPrompt;

    constructor(private settings: OAuthPromptSettingsWithTimeout, validator?: prompts.PromptValidator<any, any>) { 
        super();
        this.prompt = prompts.createOAuthPrompt(settings, validator);
    }

    public dialogBegin(dc: DialogContext<C>, options: PromptOptions): Promise<any> {
        // Persist options and state
        const timeout = typeof this.settings.timeout === 'number' ? this.settings.timeout : 54000000; 
        const instance = dc.instance;
        instance.state = Object.assign({
            expires: new Date().getTime() + timeout
        } as OAuthPromptState, options);

        // Attempt to get the users token
        return this.prompt.getUserToken(dc.context).then((output) => {
            if (output !== undefined) {
                // Return token
                return dc.end(output);
            } else if (typeof options.prompt === 'string') {
                // Send supplied prompt then OAuthCard
                return dc.context.sendActivity(options.prompt, options.speak)
                    .then(() => this.prompt.prompt(dc.context));
            } else {
                // Send OAuthCard
                return this.prompt.prompt(dc.context, options.prompt);
            }
        });
    }

    public dialogContinue(dc: DialogContext<C>): Promise<any> {
        // Recognize token
        return this.prompt.recognize(dc.context).then((output) => {
            // Check for timeout
            const state = dc.instance.state as OAuthPromptState;
            const isMessage = dc.context.activity.type === ActivityTypes.Message;
            const hasTimedOut = isMessage && (new Date().getTime() > state.expires);

            // Process output
            if (output || hasTimedOut) {
                // Return token or undefined on timeout
                return dc.end(output);
            } else if (isMessage && state.retryPrompt) {
                // Send retry prompt
                return dc.context.sendActivity(state.retryPrompt, state.retrySpeak, InputHints.ExpectingInput);
            }
        });
    }

    public signOutUser(context: TurnContext): Promise<void> {
        return this.prompt.signOutUser(context);
    }
}
