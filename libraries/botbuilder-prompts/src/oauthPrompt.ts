/**
 * @module botbuilder-prompts
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Promiseable, Activity, TurnContext, Attachment, TokenResponse, BotFrameworkAdapter, CardFactory, MessageFactory, ActivityTypes } from 'botbuilder';
import { PromptValidator } from './textPrompt';
import { sendPrompt } from './internal';

/** Defines settings for an OAuthPrompt. */
export interface OAuthPromptSettings {
    /** Name of the OAuth connection being used. */
    connectionName: string;

    /** Title of the cards signin button. */
    title: string;

    /** (Optional) additional text to include on the signin card. */
    text?: string;
}

/** Prompts the user to sign in using the Bot Frameworks Single Sign On (SSO) service. */
export interface OAuthPrompt<O = TokenResponse> {
    /**
     * Sends a formated prompt to the user. 
     * @param context Context for the current turn of conversation.
     * @param prompt (Optional) activity to send along the user. This should include an attachment containing an `OAuthCard`. If ommited, an activity will be automatically generated.
     */
    prompt(context: TurnContext, prompt?: Partial<Activity>): Promise<void>;

    /**
     * Recognizes and validates replies to a call to [prompt()](#prompt).
     * @param context Context for the current turn of conversation.
     * @param connectionName Name of the auth connection to use.
     */
    recognize(context: TurnContext): Promise<O|undefined>;

    /**
     * Attempts to retrieve the cached token for a signed in user.
     * @param context Context for the current turn of conversation.
     */
    getUserToken(context: TurnContext): Promise<O|undefined>;

    /**
     * Signs the user out of the service.
     * @param context Context for the current turn of conversation.
     */
    signOutUser(context: TurnContext): Promise<void>;
}

/**
 * Creates a new prompt that asks the user to enter some text.
 * @param settings Configuration settings for the OAuthPrompt.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 */
export function createOAuthPrompt<O = TokenResponse>(settings: OAuthPromptSettings, validator?: PromptValidator<TokenResponse, O>): OAuthPrompt<O> {
    return {
        prompt: function prompt(context, prompt) {
            try {
                // Validate adapter type
                if (!('getUserToken' in context.adapter)) { throw new Error(`OAuthPrompt.prompt(): not supported for the current adapter.`) }

                // Format prompt
                if (typeof prompt !== 'object') {
                    prompt = MessageFactory.attachment(CardFactory.oauthCard(
                        settings.connectionName,
                        settings.title,
                        settings.text
                    ));
                } else {
                    // Validate prompt
                    if (!Array.isArray(prompt.attachments)) { throw new Error(`OAuthPrompt.prompt(): supplied prompt missing attachments.`) }
                    const found = prompt.attachments.filter(a => a.contentType === CardFactory.contentTypes.oauthCard);
                    if (found.length == 0) { throw new Error(`OAuthPrompt.prompt(): supplied prompt missing OAuthCard.`) }
                }

                // Send prompt
                return sendPrompt(context, prompt);
            } catch(err) {
                return Promise.reject(err);
            }
        },
        recognize: function recognize(context) {
            // Validate adapter type
            if (!('getUserToken' in context.adapter)) { throw new Error(`OAuthPrompt.recognize(): not supported for the current adapter.`) }

            // Attempt to get the token
            return Promise.resolve()
                .then(() => {
                    if (isTokenResponseEvent(context)) {
                        return Promise.resolve(context.activity.value as TokenResponse);
                    } else if (context.activity.type === ActivityTypes.Message) {
                        const matched = /(\d{6})/.exec(context.activity.text);
                        if (matched && matched.length > 1) {
                            const adapter = context.adapter as BotFrameworkAdapter;
                            return adapter.getUserToken(context, settings.connectionName, matched[1]);
                        } else {
                            return Promise.resolve(undefined);
                        }
                    }
                })
                .then((value: TokenResponse|undefined) => validator ? validator(context, value) : value as any);
        },
        getUserToken: function getUserToken(context) {
            // Validate adapter type
            if (!('getUserToken' in context.adapter)) { throw new Error(`OAuthPrompt.getUserToken(): not supported for the current adapter.`) }
            
            // Get the token and call validator
            const adapter = context.adapter as BotFrameworkAdapter;
            return adapter.getUserToken(context, settings.connectionName)
                          .then((value) => {
                                return Promise.resolve(validator ? validator(context, value) : value as any);
                          });
        },
        signOutUser: function signOutUser(context) {
            // Validate adapter type
            if (!('signOutUser' in context.adapter)) { throw new Error(`OAuthPrompt.signOutUser(): not supported for the current adapter.`) }

            // Sign out user
            const adapter = context.adapter as BotFrameworkAdapter;
            return adapter.signOutUser(context, settings.connectionName);
        }
    };
}

function isTokenResponseEvent(context: TurnContext): boolean {
    const a = context.activity;
    return (a.type === ActivityTypes.Event && a.name === 'tokens/response')

}
