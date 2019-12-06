/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { InputDialogConfiguration, PromptType } from "./inputDialog";
import { DialogContext, Dialog, DialogTurnResult, PromptOptions, PromptRecognizerResult } from "botbuilder-dialogs";
import { Attachment, InputHints, TokenResponse, IUserTokenProvider, TurnContext, ActivityTypes, Activity, MessageFactory, CardFactory, OAuthLoginTimeoutKey } from "botbuilder-core";
import { ExpressionPropertyValue, ExpressionProperty } from "../expressionProperty";

export interface OAuthInputConfiguration extends InputDialogConfiguration {
    /**
     * Name of the OAuth connection being used.
     */
    connectionName: string;

    /**
     * Title of the cards signin button.
     */
    title: string;

    /**
     * (Optional) additional text to include on the signin card.
     */
    text?: string;

    /**
     * (Optional) number of milliseconds the prompt will wait for the user to authenticate.
     * Defaults to a value `900,000` (15 minutes.)
     */
    timeout?: number;
}

export const channels: any = {
    console: 'console',
    cortana: 'cortana',
    directline: 'directline',
    email: 'email',
    emulator: 'emulator',
    facebook: 'facebook',
    groupme: 'groupme',
    kik: 'kik',
    line: 'line',
    msteams: 'msteams',
    skype: 'skype',
    skypeforbusiness: 'skypeforbusiness',
    slack: 'slack',
    sms: 'sms',
    telegram: 'telegram',
    webchat: 'webchat'
};


export class OAuthInput extends Dialog {

    /**
     * Name of the OAuth connection being used.
     */
    public connectionName: string;

    /**
     * Title of the cards signin button.
     */
    public title: string;

    /**
     * (Optional) additional text to include on the signin card.
     */
    public text?: string;

    /**
     * (Optional) number of milliseconds the prompt will wait for the user to authenticate.
     * Defaults to a value `900,000` (15 minutes.)
     */
    public timeout?: number;

    /**
     * Gets or sets the memory property to use for token result.
     */
    public tokenProperty: string;

    constructor(connectionName?: string, title?: string, text?: string, timeout?: number, tokenProperty?: string) {
        super();
        this.connectionName = connectionName;
        this.title = title;
        this.text = text;
        this.timeout = timeout;
        this.tokenProperty = tokenProperty;
    }

    public async beginDialog(dc: DialogContext, options?: PromptOptions): Promise<DialogTurnResult> {
        // Ensure prompts have input hint set
        const o: Partial<PromptOptions> = { ...options };
        if (o.prompt && typeof o.prompt === 'object' && typeof o.prompt.inputHint !== 'string') {
            o.prompt.inputHint = InputHints.AcceptingInput;
        }
        if (o.retryPrompt && typeof o.retryPrompt === 'object' && typeof o.retryPrompt.inputHint !== 'string') {
            o.retryPrompt.inputHint = InputHints.AcceptingInput;
        }

        // Initialize prompt state
        const timeout: number = typeof this.timeout === 'number' ? this.timeout : 900000;
        const state: OAuthPromptState = dc.activeDialog.state as OAuthPromptState;
        state.state = {};
        state.options = o;
        state.expires = new Date().getTime() + timeout;

        // Attempt to get the users token
        const output: TokenResponse = await this.getUserToken(dc.context);
        if (output !== undefined) {
            // Set token into token property
            if (this.tokenProperty) {
                dc.state.setValue(this.tokenProperty, output);
            }

            // Return token
            return await dc.endDialog(output);
        } else {
            // Prompt user to login
            await this.sendOAuthCardAsync(dc.context, state.options.prompt);

            return Dialog.EndOfTurn;
        }
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Recognize token
        const recognized: PromptRecognizerResult<TokenResponse> = await this.recognizeToken(dc.context);

        // Check for timeout
        const state: OAuthPromptState = dc.activeDialog.state as OAuthPromptState;
        const isMessage: boolean = dc.context.activity.type === ActivityTypes.Message;
        const hasTimedOut: boolean = isMessage && (new Date().getTime() > state.expires);
        if (hasTimedOut) {
            // Set token into token property
            if (this.tokenProperty) {
                dc.state.setValue(this.tokenProperty, null);
            }

            return await dc.endDialog(undefined);
        } else {

            if (state.state['attemptCount'] === undefined) {
                state.state['attemptCount'] = 1;
            }

            // Validate the return value
            let isValid = false;

            if (recognized.succeeded) {
                isValid = true;
            }

            // Return recognized value or re-prompt
            if (isValid) {
                // Set token into token property
                if (this.tokenProperty) {
                    dc.state.setValue(this.tokenProperty, recognized.value);
                }

                return await dc.endDialog(recognized.value);
            } else {
                // Send retry prompt
                if (!dc.context.responded && isMessage && state.options.retryPrompt) {
                    await dc.context.sendActivity(state.options.retryPrompt);
                }

                return Dialog.EndOfTurn;
            }
        }
    }

    /**
     * Attempts to retrieve the stored token for the current user.
     * @param context Context reference the user that's being looked up.
     * @param code (Optional) login code received from the user.
     */
    public async getUserToken(context: TurnContext, code?: string): Promise<TokenResponse | undefined> {
        // Validate adapter type
        if (!('getUserToken' in context.adapter)) {
            throw new Error(`OAuthPrompt.getUserToken(): not supported for the current adapter.`);
        }

        // Get the token and call validator
        const adapter: IUserTokenProvider = context.adapter as IUserTokenProvider;

        return await adapter.getUserToken(context, this.connectionName, code);
    }

    /**
     * Signs the user out of the service.
     *
     * @remarks
     * This example shows creating an instance of the prompt and then signing out the user.
     *
     * ```JavaScript
     * const prompt = new OAuthPrompt({
     *    connectionName: 'GitConnection',
     *    title: 'Login To GitHub'
     * });
     * await prompt.signOutUser(context);
     * ```
     * @param context Context referencing the user that's being signed out.
     */
    public async signOutUser(context: TurnContext): Promise<void> {
        // Validate adapter type
        if (!('signOutUser' in context.adapter)) {
            throw new Error(`OAuthPrompt.signOutUser(): not supported for the current adapter.`);
        }

        // Sign out user
        const adapter: IUserTokenProvider = context.adapter as IUserTokenProvider;

        return adapter.signOutUser(context, this.connectionName);
    }

    private async sendOAuthCardAsync(context: TurnContext, prompt?: string | Partial<Activity>): Promise<void> {
        // Validate adapter type
        if (!('getUserToken' in context.adapter)) {
            throw new Error(`OAuthPrompt.prompt(): not supported for the current adapter.`);
        }

        // Initialize outgoing message
        const msg: Partial<Activity> =
            typeof prompt === 'object' ? { ...prompt } : MessageFactory.text(prompt, undefined, InputHints.AcceptingInput);
        if (!Array.isArray(msg.attachments)) { msg.attachments = []; }

        // Add login card as needed
        if (this.channelSupportsOAuthCard(context.activity.channelId)) {
            const cards: Attachment[] = msg.attachments.filter((a: Attachment) => a.contentType === CardFactory.contentTypes.oauthCard);
            if (cards.length === 0) {
                let link: string = undefined;
                if (this.isFromStreamingConnection(context.activity)) {
                    link = await (context.adapter as any).getSignInLink(context, this.connectionName);
                }
                // Append oauth card
                msg.attachments.push(CardFactory.oauthCard(
                    this.connectionName,
                    this.title,
                    this.text,
                    link
                ));
            }
        } else {
            const cards: Attachment[] = msg.attachments.filter((a: Attachment) => a.contentType === CardFactory.contentTypes.signinCard);
            if (cards.length === 0) {
                // Append signin card
                const link: any = await (context.adapter as any).getSignInLink(context, this.connectionName);
                msg.attachments.push(CardFactory.signinCard(
                    this.title,
                    link,
                    this.text
                ));
            }
        }

        // Add the login timeout specified in OAuthPromptSettings to TurnState so it can be referenced if polling is needed
        if (!context.turnState.get(OAuthLoginTimeoutKey) && this.timeout) {
            context.turnState.set(OAuthLoginTimeoutKey, this.timeout);
        }

        // Send prompt
        await context.sendActivity(msg);
    }

    private async recognizeToken(context: TurnContext): Promise<PromptRecognizerResult<TokenResponse>> {
        let token: TokenResponse | undefined;
        if (this.isTokenResponseEvent(context)) {
            token = context.activity.value as TokenResponse;
        } else if (this.isTeamsVerificationInvoke(context)) {
            const code: any = context.activity.value.state;
            try {
                token = await this.getUserToken(context, code);
                if (token !== undefined) {
                    await context.sendActivity({ type: 'invokeResponse', value: { status: 200 } });
                } else {
                    await context.sendActivity({ type: 'invokeResponse', value: { status: 404 } });
                }
            }
            catch (e) {
                await context.sendActivity({ type: 'invokeResponse', value: { status: 500 } });
            }
        } else if (context.activity.type === ActivityTypes.Message) {
            const matched: RegExpExecArray = /(\d{6})/.exec(context.activity.text);
            if (matched && matched.length > 1) {
                token = await this.getUserToken(context, matched[1]);
            }
        }

        return token !== undefined ? { succeeded: true, value: token } : { succeeded: false };
    }

    private isFromStreamingConnection(activity: Activity): boolean {
        return activity && activity.serviceUrl && !activity.serviceUrl.toLowerCase().startsWith('http');
    }

    private isTokenResponseEvent(context: TurnContext): boolean {
        const activity: Activity = context.activity;

        return activity.type === ActivityTypes.Event && activity.name === 'tokens/response';
    }



    private isTeamsVerificationInvoke(context: TurnContext): boolean {
        const activity: Activity = context.activity;

        return activity.type === ActivityTypes.Invoke && activity.name === 'signin/verifyState';
    }

    private channelSupportsOAuthCard(channelId: string): boolean {
        switch (channelId) {
            case channels.msteams:
            case channels.cortana:
            case channels.skype:
            case channels.skypeforbusiness:
                return false;
            default:
        }

        return true;
    }


}
/**
 * @private
 */
interface OAuthPromptState {
    state: any;
    options: PromptOptions;
    expires: number;        // Timestamp of when the prompt will timeout.
}
