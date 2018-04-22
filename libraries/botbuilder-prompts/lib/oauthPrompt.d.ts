/**
 * @module botbuilder-prompts
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, TurnContext, TokenResponse } from 'botbuilder';
import { PromptValidator } from './textPrompt';
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
    recognize(context: TurnContext): Promise<O | undefined>;
    /**
     * Attempts to retrieve the cached token for a signed in user.
     * @param context Context for the current turn of conversation.
     */
    getUserToken(context: TurnContext): Promise<O | undefined>;
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
export declare function createOAuthPrompt<O = TokenResponse>(settings: OAuthPromptSettings, validator?: PromptValidator<TokenResponse, O>): OAuthPrompt<O>;
