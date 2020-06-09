/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext, Dialog, DialogTurnResult, PromptOptions, PromptRecognizerResult } from 'botbuilder-dialogs';
import { Attachment, InputHints, TokenResponse, IUserTokenProvider, TurnContext, ActivityTypes, Activity, MessageFactory, CardFactory, OAuthLoginTimeoutKey } from 'botbuilder-core';
import { InputDialog, InputState } from './inputDialog';
import { StringExpression, IntExpression } from 'adaptive-expressions';

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


export class OAuthInput extends InputDialog {
    /**
     * Name of the OAuth connection being used.
     */
    public connectionName: StringExpression;

    /**
     * Title of the cards signin button.
     */
    public title: StringExpression;

    /**
     * (Optional) additional text to include on the signin card.
     */
    public text?: StringExpression;

    /**
     * (Optional) number of milliseconds the prompt will wait for the user to authenticate.
     * Defaults to a value `900,000` (15 minutes.)
     */
    public timeout?: IntExpression = new IntExpression(900000);

    public constructor(connectionName?: string, title?: string, text?: string, timeout?: number) {
        super();
        this.connectionName = new StringExpression(connectionName);
        this.title = new StringExpression(title);
        this.text = new StringExpression(text);
        if (timeout) { this.timeout = new IntExpression(timeout); }
    }

    public async beginDialog(dc: DialogContext, options?: PromptOptions): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        // Ensure prompts have input hint set
        const o: Partial<PromptOptions> = { ...options };
        if (o.prompt && typeof o.prompt === 'object' && typeof o.prompt.inputHint !== 'string') {
            o.prompt.inputHint = InputHints.AcceptingInput;
        }
        if (o.retryPrompt && typeof o.retryPrompt === 'object' && typeof o.retryPrompt.inputHint !== 'string') {
            o.retryPrompt.inputHint = InputHints.AcceptingInput;
        }

        // Initialize prompt state
        const timeout: number = this.timeout.getValue(dc.state) || 900000;
        const state: OAuthPromptState = dc.activeDialog.state as OAuthPromptState;
        state.state = {};
        state.options = o;
        state.expires = new Date().getTime() + timeout;

        // Attempt to get the users token
        const output: TokenResponse = await this.getUserToken(dc);
        if (output !== undefined) {
            // Set token into token property
            if (this.property) {
                dc.state.setValue(this.property.getValue(dc.state), output);
            }

            // Return token
            return await dc.endDialog(output);
        } else {
            // Prompt user to login
            await this.sendOAuthCardAsync(dc, state.options.prompt);

            return Dialog.EndOfTurn;
        }
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Recognize token
        const recognized: PromptRecognizerResult<TokenResponse> = await this.recognizeToken(dc);

        // Check for timeout
        const state: OAuthPromptState = dc.activeDialog.state as OAuthPromptState;
        const isMessage: boolean = dc.context.activity.type === ActivityTypes.Message;
        const hasTimedOut: boolean = isMessage && (new Date().getTime() > state.expires);
        if (hasTimedOut) {
            // Set token into token property
            if (this.property) {
                dc.state.setValue(this.property.getValue(dc.state), null);
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
                if (this.property) {
                    dc.state.setValue(this.property.getValue(dc.state), recognized.value);
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
    public async getUserToken(dc: DialogContext, code?: string): Promise<TokenResponse | undefined> {
        // Validate adapter type
        if (!('getUserToken' in dc.context.adapter)) {
            throw new Error(`OAuthPrompt.getUserToken(): not supported for the current adapter.`);
        }

        // Get the token and call validator
        const adapter: IUserTokenProvider = dc.context.adapter as IUserTokenProvider;

        return await adapter.getUserToken(dc.context, this.connectionName.getValue(dc.state), code);
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
    public async signOutUser(dc: DialogContext): Promise<void> {
        // Validate adapter type
        if (!('signOutUser' in dc.context.adapter)) {
            throw new Error(`OAuthPrompt.signOutUser(): not supported for the current adapter.`);
        }

        // Sign out user
        const adapter: IUserTokenProvider = dc.context.adapter as IUserTokenProvider;

        return adapter.signOutUser(dc.context, this.connectionName.getValue(dc.state));
    }

    protected onComputeId(): string {
        return `OAuthInput[${ this.prompt && this.prompt.toString() }]`;
    }

    protected onRecognizeInput(dc: DialogContext): Promise<InputState> {
        throw new Error('Method not implemented.');
    }

    private async sendOAuthCardAsync(dc: DialogContext, prompt?: string | Partial<Activity>): Promise<void> {
        // Validate adapter type
        if (!('getUserToken' in dc.context.adapter)) {
            throw new Error(`OAuthPrompt.prompt(): not supported for the current adapter.`);
        }

        // Initialize outgoing message
        const msg: Partial<Activity> =
            typeof prompt === 'object' ? { ...prompt } : MessageFactory.text(prompt, undefined, InputHints.AcceptingInput);
        if (!Array.isArray(msg.attachments)) { msg.attachments = []; }

        // Add login card as needed
        if (this.channelSupportsOAuthCard(dc.context.activity.channelId)) {
            const cards: Attachment[] = msg.attachments.filter((a: Attachment) => a.contentType === CardFactory.contentTypes.oauthCard);
            if (cards.length === 0) {
                let link: string = undefined;
                if (this.isFromStreamingConnection(dc.context.activity)) {
                    link = await (dc.context.adapter as any).getSignInLink(dc.context, this.connectionName.getValue(dc.state));
                }
                // Append oauth card
                msg.attachments.push(CardFactory.oauthCard(
                    this.connectionName.getValue(dc.state),
                    this.title.getValue(dc.state),
                    this.text.getValue(dc.state),
                    link
                ));
            }
        } else {
            const cards: Attachment[] = msg.attachments.filter((a: Attachment) => a.contentType === CardFactory.contentTypes.signinCard);
            if (cards.length === 0) {
                // Append signin card
                const link: any = await (dc.context.adapter as any).getSignInLink(dc.context, this.connectionName.getValue(dc.state));
                msg.attachments.push(CardFactory.signinCard(
                    this.title.getValue(dc.state),
                    link,
                    this.text.getValue(dc.state)
                ));
            }
        }

        // Add the login timeout specified in OAuthPromptSettings to TurnState so it can be referenced if polling is needed
        if (!dc.context.turnState.get(OAuthLoginTimeoutKey) && this.timeout) {
            dc.context.turnState.set(OAuthLoginTimeoutKey, this.timeout.getValue(dc.state));
        }

        // Send prompt
        await dc.context.sendActivity(msg);
    }

    private async recognizeToken(dc: DialogContext): Promise<PromptRecognizerResult<TokenResponse>> {
        let token: TokenResponse | undefined;
        if (this.isTokenResponseEvent(dc.context)) {
            token = dc.context.activity.value as TokenResponse;
        } else if (this.isTeamsVerificationInvoke(dc.context)) {
            const code: any = dc.context.activity.value.state;
            try {
                token = await this.getUserToken(dc, code);
                if (token !== undefined) {
                    await dc.context.sendActivity({ type: 'invokeResponse', value: { status: 200 } });
                } else {
                    await dc.context.sendActivity({ type: 'invokeResponse', value: { status: 404 } });
                }
            }
            catch (e) {
                await dc.context.sendActivity({ type: 'invokeResponse', value: { status: 500 } });
            }
        } else if (dc.context.activity.type === ActivityTypes.Message) {
            const matched: RegExpExecArray = /(\d{6})/.exec(dc.context.activity.text);
            if (matched && matched.length > 1) {
                token = await this.getUserToken(dc, matched[1]);
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
