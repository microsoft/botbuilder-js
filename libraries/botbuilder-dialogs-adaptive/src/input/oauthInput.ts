/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StringExpression, IntExpression } from 'adaptive-expressions';
import { DialogContext, Dialog, DialogTurnResult, PromptOptions, PromptRecognizerResult, ThisPath, TurnPath } from 'botbuilder-dialogs';
import { Attachment, InputHints, TokenResponse, IUserTokenProvider, TurnContext, ActivityTypes, Activity, MessageFactory, CardFactory, OAuthLoginTimeoutKey, StatusCodes, ActionTypes, ExtendedUserTokenProvider, OAuthCard, BotAdapter, Channels, TokenExchangeInvokeRequest } from 'botbuilder-core';
import { SkillValidation } from 'botframework-connector';
import { verifyStateOperationName, tokenExchangeOperationName, tokenResponseEventName } from 'botbuilder-core';
import { InputDialog, InputState } from './inputDialog';

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

const persistedOptions = 'options';
const persistedState = 'state';
const persistedExpires = 'expires';
const attemptCountKey = 'attemptCount';

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

        const op = this.onInitializeOptions(dc, options);
        dc.state.setValue(ThisPath.options, op);
        dc.state.setValue(InputDialog.TURN_COUNT_PROPERTY, 0);

        // If alwaysPrompt is set to true, then clear property value for turn 0.
        if (this.property && this.alwaysPrompt && this.alwaysPrompt.getValue(dc.state)) {
            dc.state.deleteValue(this.property.getValue(dc.state));
        }

        // Initialize prompt state
        const state: OAuthPromptState = dc.activeDialog.state as OAuthPromptState;
        state[persistedOptions] = o;
        state[persistedState] = {};
        state[persistedState][attemptCountKey] = 0;
        state[persistedExpires] = new Date().getTime() + this.timeout.getValue(dc.state) || 900000;

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
            dc.state.setValue(InputDialog.TURN_COUNT_PROPERTY, 1);

            // Prompt user to login
            await this.sendOAuthCardAsync(dc, state.options.prompt);

            return Dialog.EndOfTurn;
        }
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        if (!dc) { throw new Error('Missing DialogContext'); }

        const interrupted = dc.state.getValue(TurnPath.interrupted, false);
        const turnCount = dc.state.getValue(InputDialog.TURN_COUNT_PROPERTY, 0);

        // Recognize token
        const recognized: PromptRecognizerResult<TokenResponse> = await this.recognizeToken(dc);

        // Check for timeout
        const state: OAuthPromptState = dc.activeDialog.state as OAuthPromptState;
        const expires = state[persistedExpires];
        const isMessage: boolean = dc.context.activity.type === ActivityTypes.Message;
        const hasTimedOut: boolean = isMessage && (new Date().getTime() > expires);

        if (hasTimedOut) {
            if (this.property) {
                dc.state.deleteValue(this.property.getValue(dc.state));
            }

            return await dc.endDialog(undefined);
        } else {

            const promptState = state[persistedState];
            const promptOptions = state[persistedOptions];

            promptState[attemptCountKey] += 1;

            // Validate the return value
            let inputState = InputState.invalid;
            if (recognized.succeeded) {
                inputState = InputState.valid;
            }

            // Return recognized value or re-prompt
            if (inputState === InputState.valid) {
                // Set token into token property
                if (this.property) {
                    dc.state.setValue(this.property.getValue(dc.state), recognized.value);
                }

                return await dc.endDialog(recognized.value);
            } else if (!this.maxTurnCount || turnCount < this.maxTurnCount.getValue(dc.state)) {
                if (!interrupted) {
                    // increase the turnCount as last step
                    dc.state.setValue(InputDialog.TURN_COUNT_PROPERTY, turnCount + 1);
                    const prompt = await this.onRenderPrompt(dc, inputState);
                    await dc.context.sendActivity(prompt);
                }

                await this.sendOAuthCardAsync(dc, promptOptions && promptOptions.prompt);
                return Dialog.EndOfTurn;
            } else {
                if (this.defaultValue) {
                    const { value } = this.defaultValue.tryGetValue(dc.state);
                    if (this.defaultValueResponse) {
                        const response = await this.defaultValueResponse.bind(dc, dc.state);
                        const properties = {
                            'template': JSON.stringify(this.defaultValueResponse),
                            'result': response ? JSON.stringify(response) : ''
                        };
                        this.telemetryClient.trackEvent({
                            name: 'GeneratorResult',
                            properties
                        });
                        await dc.context.sendActivity(response);
                    }

                    // set output property
                    dc.state.setValue(this.property.getValue(dc.state), value);
                    return await dc.endDialog(value);
                }
            }

            return await dc.endDialog();
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
        const turnContext = dc.context;

        // Validate adapter type
        if (!('getUserToken' in turnContext.adapter)) {
            throw new Error(`OAuthPrompt.sendOAuthCardAsync(): not supported for the current adapter.`);
        }

        // Initialize outgoing message
        const msg: Partial<Activity> =
            typeof prompt === 'object' ? { ...prompt } : MessageFactory.text(prompt, undefined, InputHints.AcceptingInput);
        if (!Array.isArray(msg.attachments)) { msg.attachments = []; }

        // Add login card as needed
        if (this.channelSupportsOAuthCard(turnContext.activity.channelId)) {
            const cards: Attachment[] = msg.attachments.filter((a: Attachment) => a.contentType === CardFactory.contentTypes.oauthCard);
            if (cards.length === 0) {
                let cardActionType = ActionTypes.Signin;
                const signInResource = await (turnContext.adapter as ExtendedUserTokenProvider).getSignInResource(turnContext, this.connectionName.getValue(dc.state), turnContext.activity.from.id);
                let link = signInResource.signInLink;
                const identity = turnContext.turnState.get((turnContext.adapter as BotAdapter).BotIdentityKey);

                // use the SignInLink when 
                //   in speech channel or
                //   bot is a skill or
                //   an extra OAuthAppCredentials is being passed in
                if ((identity && SkillValidation.isSkillClaim(identity.claims)) || this.isFromStreamingConnection(turnContext.activity)) {
                    if (turnContext.activity.channelId === Channels.Emulator) {
                        cardActionType = ActionTypes.OpenUrl;
                    }
                } else {
                    link = undefined;
                }

                // Append oauth card
                const card = CardFactory.oauthCard(
                    this.connectionName.getValue(dc.state),
                    this.title.getValue(dc.state),
                    this.text.getValue(dc.state),
                    link,
                    signInResource.tokenExchangeResource
                );

                // Set the appropriate ActionType for the button.
                (card.content as OAuthCard).buttons[0].type = cardActionType;
                msg.attachments.push(card);
            }
        } else {
            const cards: Attachment[] = msg.attachments.filter((a: Attachment) => a.contentType === CardFactory.contentTypes.signinCard);
            if (cards.length === 0) {
                // Append signin card
                const signInResource = await (turnContext.adapter as ExtendedUserTokenProvider).getSignInResource(turnContext, this.connectionName.getValue(dc.state), turnContext.activity.from.id);
                msg.attachments.push(CardFactory.signinCard(
                    this.title.getValue(dc.state),
                    signInResource.signInLink,
                    this.text.getValue(dc.state)
                ));
            }
        }

        // Add the login timeout specified in OAuthPromptSettings to TurnState so it can be referenced if polling is needed
        if (!turnContext.turnState.get(OAuthLoginTimeoutKey) && this.timeout) {
            turnContext.turnState.set(OAuthLoginTimeoutKey, this.timeout.getValue(dc.state));
        }

        if (!msg.inputHint) {
            msg.inputHint = InputHints.AcceptingInput;
        }

        // Send prompt
        await turnContext.sendActivity(msg);
    }

    private async recognizeToken(dc: DialogContext): Promise<PromptRecognizerResult<TokenResponse>> {
        const turnContext = dc.context;

        let token: TokenResponse | undefined;
        if (this.isTokenResponseEvent(turnContext)) {
            token = turnContext.activity.value as TokenResponse;
        } else if (this.isTeamsVerificationInvoke(turnContext)) {
            const code: any = turnContext.activity.value.state;
            try {
                token = await this.getUserToken(dc, code);
                if (token !== undefined) {
                    await this.sendInvokeResponse(turnContext, StatusCodes.OK);
                } else {
                    await this.sendInvokeResponse(turnContext, StatusCodes.NOT_FOUND);
                }
            }
            catch (e) {
                await this.sendInvokeResponse(turnContext, StatusCodes.INTERNAL_SERVER_ERROR);
            }
        } else if (this.isTokenExchangeRequestInvoke(turnContext)) {
            const connectionName = this.connectionName.getValue(dc.state);
            const tokenExchangeRequest = turnContext.activity.value as TokenExchangeInvokeRequest;
            // Received activity is not a token exchange request
            if (!(tokenExchangeRequest && this.isTokenExchangeRequest(tokenExchangeRequest))) {
                const failureDetail = 'The bot received an InvokeActivity that is missing a TokenExchangeInvokeRequest value. This is required to be sent with the InvokeActivity.';
                await this.sendInvokeResponse(turnContext, StatusCodes.BAD_REQUEST, { connectionName, failureDetail });
            } else if (tokenExchangeRequest.connectionName != connectionName) {
                // Connection name on activity does not match that of setting
                const id = tokenExchangeRequest.id;
                const failureDetail = 'The bot received an InvokeActivity with a TokenExchangeInvokeRequest containing a ConnectionName that does not match the ConnectionName' +
                    'expected by the bots active OAuthPrompt. Ensure these names match when sending the InvokeActivityInvalid ConnectionName in the TokenExchangeInvokeRequest';
                await this.sendInvokeResponse(turnContext, StatusCodes.BAD_REQUEST, { id, connectionName, failureDetail });
            }
            else if (!('exchangeToken' in turnContext.adapter)) {
                // Token Exchange not supported in the adapter
                const id = tokenExchangeRequest.id;
                const failureDetail = 'The bot\'s BotAdapter does not support token exchange operations. Ensure the bot\'s Adapter supports the ExtendedUserTokenProvider interface.';
                await this.sendInvokeResponse(turnContext, StatusCodes.BAD_REQUEST, { id, connectionName, failureDetail });
                throw new Error('OAuthPrompt.recognizeToken(): not supported by the current adapter');
            } else {
                const extendedUserTokenProvider: ExtendedUserTokenProvider = turnContext.adapter as ExtendedUserTokenProvider;
                let tokenExchangeResponse: TokenResponse;
                try {
                    tokenExchangeResponse = await extendedUserTokenProvider.exchangeToken(
                        turnContext,
                        connectionName,
                        turnContext.activity.from.id,
                        { token: tokenExchangeRequest.token });
                } catch (err) {
                    // Ignore errors.
                    // If the token exchange failed for any reason, the tokenExchangeResponse stays undefined
                    // and we send back a failure invoke response to the caller.
                }

                const id = tokenExchangeRequest.id;
                if (!tokenExchangeResponse || !tokenExchangeResponse.token) {
                    const failureDetail = 'The bot is unable to exchange token. Proceed with regular login.';
                    await this.sendInvokeResponse(turnContext, StatusCodes.CONFLICT, { id, connectionName, failureDetail });
                } else {
                    await this.sendInvokeResponse(turnContext, StatusCodes.OK, { id, connectionName });
                    token = {
                        channelId: tokenExchangeResponse.channelId,
                        connectionName: tokenExchangeResponse.connectionName,
                        token: tokenExchangeResponse.token,
                        expiration: undefined
                    };
                }
            }
        } else if (turnContext.activity.type === ActivityTypes.Message) {
            const matched: RegExpExecArray = /(\d{6})/.exec(turnContext.activity.text);
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

        return activity.type === ActivityTypes.Event && activity.name === tokenResponseEventName;
    }

    private isTeamsVerificationInvoke(context: TurnContext): boolean {
        const activity: Activity = context.activity;

        return activity.type === ActivityTypes.Invoke && activity.name === verifyStateOperationName;
    }

    private isTokenExchangeRequestInvoke(context: TurnContext): boolean {
        const activity: Activity = context.activity;

        return activity.type === ActivityTypes.Invoke && activity.name === tokenExchangeOperationName;
    }

    private isTokenExchangeRequest(obj: unknown): obj is TokenExchangeInvokeRequest {
        if (obj.hasOwnProperty('token')) {
            return true;
        }
        return false;
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

    private async sendInvokeResponse(turnContext: TurnContext, status: StatusCodes, body?: object): Promise<void> {
        await turnContext.sendActivity({
            type: 'invokeResponse',
            value: {
                status,
                body
            }
        });
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
