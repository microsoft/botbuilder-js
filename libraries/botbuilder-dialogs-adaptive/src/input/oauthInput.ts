/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { InputDialog, InputDialogConfiguration, InputState } from './inputDialog';
import { IntProperty, StringProperty } from '../properties';
import { TextTemplate } from '../templates';
import { TelemetryLoggerConstants } from '../telemetryLoggerConstants';

import {
    ConversationState,
    tokenExchangeOperationName,
    tokenResponseEventName,
    verifyStateOperationName,
} from 'botbuilder';

import {
    Expression,
    IntExpression,
    IntExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

import {
    Activity,
    ActivityTypes,
    InputHints,
    StatusCodes,
    TokenExchangeInvokeRequest,
    TokenResponse,
    TurnContext,
} from 'botbuilder';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogContext,
    DialogStateManager,
    DialogTurnResult,
    OAuthPrompt,
    OAuthPromptSettings,
    PromptOptions,
    PromptRecognizerResult,
    ThisPath,
    TurnPath,
} from 'botbuilder-dialogs';

export const channels = {
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
    webchat: 'webchat',
};

const persistedOptions = 'options';
const persistedState = 'state';
const persistedExpires = 'expires';
const attemptCountKey = 'attemptCount';

export interface OAuthInputConfiguration extends InputDialogConfiguration {
    connectionName?: StringProperty;
    title?: StringProperty;
    text?: StringProperty;
    timeout?: IntProperty;
}

/**
 * OAuthInput prompts user to login.
 */
export class OAuthInput extends InputDialog implements OAuthInputConfiguration {
    static $kind = 'Microsoft.OAuthInput';

    /**
     * Name of the OAuth connection being used.
     */
    connectionName: StringExpression;

    /**
     * Title of the cards signin button.
     */
    title: StringExpression;

    /**
     * (Optional) additional text to include on the signin card.
     */
    text?: StringExpression;

    /**
     * (Optional) number of milliseconds the prompt will wait for the user to authenticate.
     * Defaults to a value `900,000` (15 minutes.)
     */
    timeout?: IntExpression = new IntExpression(900000);

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof OAuthInputConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'connectionName':
                return new StringExpressionConverter();
            case 'title':
                return new StringExpressionConverter();
            case 'text':
                return new StringExpressionConverter();
            case 'timeout':
                return new IntExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Initializes a new instance of the [OAuthInput](xref:botbuilder-dialogs-adaptive.OAuthInput) class
     *
     * @param connectionName Optional. Name of the OAuth connection being used.
     * @param title Optional. Title of the cards signin button.
     * @param text Optional. Additional text to include on the signin card.
     * @param timeout Optional. Number of milliseconds the prompt will wait for the user to authenticate.
     */
    constructor(connectionName?: string, title?: string, text?: string, timeout?: number) {
        super();
        this.connectionName = new StringExpression(connectionName);
        this.title = new StringExpression(title);
        this.text = new StringExpression(text);
        if (timeout) {
            this.timeout = new IntExpression(timeout);
        }
    }

    /**
     * Called when a prompt [Dialog](xref:botbuilder-dialogs.Dialog) is pushed onto the dialog stack and is being activated.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Additional information to pass to the prompt being started.
     * @returns A [DialogTurnResult](xref:botbuilder-dialogs.DialogTurnResult) `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, options?: PromptOptions): Promise<DialogTurnResult> {
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

        const op = await this.onInitializeOptions(dc, options);
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
            await this.sendOAuthCard(dc, state.options.prompt);

            return Dialog.EndOfTurn;
        }
    }

    /**
     * Called when a prompt [Dialog](xref:botbuilder-dialogs.Dialog) is the active dialog and the user replied with a new activity.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns A [DialogTurnResult](xref:botbuilder-dialogs.DialogTurnResult) `Promise` representing the asynchronous operation.
     */
    async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        if (!dc) {
            throw new Error('Missing DialogContext');
        }

        const interrupted = dc.state.getValue(TurnPath.interrupted, false);
        const turnCount = dc.state.getValue(InputDialog.TURN_COUNT_PROPERTY, 0);

        // Recognize token
        const recognized: PromptRecognizerResult<TokenResponse> = await this.recognizeToken(dc);

        // Check for timeout
        const state: OAuthPromptState = dc.activeDialog.state as OAuthPromptState;
        const expires = state[persistedExpires];
        const isMessage: boolean = dc.context.activity.type === ActivityTypes.Message;
        const isTimeoutActivityType =
            isMessage ||
            this.isTokenResponseEvent(dc.context) ||
            this.isTeamsVerificationInvoke(dc.context) ||
            this.isTokenExchangeRequestInvoke(dc.context);
        const hasTimedOut: boolean = isTimeoutActivityType && new Date().getTime() > expires;

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

                    if (isMessage) {
                        const prompt = await this.onRenderPrompt(dc, inputState);
                        await dc.context.sendActivity(prompt);
                    }
                }

                if (isMessage) {
                    await this.sendOAuthCard(dc, promptOptions?.prompt);
                }

                return Dialog.EndOfTurn;
            } else {
                if (this.defaultValue) {
                    const { value } = this.defaultValue.tryGetValue(dc.state);
                    if (this.defaultValueResponse) {
                        const response = await this.defaultValueResponse.bind(dc, dc.state);
                        const properties = {
                            template: JSON.stringify(this.defaultValueResponse),
                            result: response ? JSON.stringify(response) : '',
                            context: TelemetryLoggerConstants.OAuthInputResultEvent,
                        };
                        this.telemetryClient.trackEvent({
                            name: TelemetryLoggerConstants.GeneratorResultEvent,
                            properties,
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
     *
     * @param dc Context reference the user that's being looked up.
     * @param code (Optional) login code received from the user.
     * @returns A promise representing the asynchronous operation.
     */
    getUserToken(dc: DialogContext, code?: string): Promise<TokenResponse | undefined> {
        return new OAuthPrompt(this.constructor.name, {
            title: undefined,
            connectionName: this.connectionName.getValue(dc.state),
        }).getUserToken(dc.context, code);
    }

    /**
     * Signs the user out of the service.
     *
     * @remarks
     * This example shows creating an instance of the prompt and then signing out the user.
     *
     * ```JavaScript
     * const prompt = new OAuthPrompt({
     *     connectionName: 'GitConnection',
     *     title: 'Login To GitHub'
     * });
     * await prompt.signOutUser(context);
     * ```
     * @param dc Context referencing the user that's being signed out.
     * @returns A promise representing the asynchronous operation.
     */
    async signOutUser(dc: DialogContext): Promise<void> {
        return new OAuthPrompt(this.constructor.name, {
            title: undefined,
            connectionName: this.connectionName.getValue(dc.state),
        }).signOutUser(dc.context);
    }

    protected onComputeId(): string {
        return `OAuthInput[${this.prompt && this.prompt.toString()}]`;
    }

    /**
     * @protected
     * Called when input has been received.
     * @param _dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     */
    protected onRecognizeInput(_dc: DialogContext): Promise<InputState> {
        throw new Error('Method not implemented.');
    }

    private async sendOAuthCard(dc: DialogContext, prompt?: string | Partial<Activity>): Promise<void> {
        // Save state prior to sending OAuthCard: the invoke response for a token exchange from the root bot could come
        // in before this method ends or could land in another instance in scale-out scenarios, which means that if the
        // state is not saved, the OAuthInput would not be at the top of the stack, and the token exchange invoke would
        // get discarded.
        const conversationState = dc.context.turnState.get<ConversationState>('ConversationState');
        if (conversationState) {
            await conversationState.saveChanges(dc.context, false);
        }

        // Prepare oauth card
        let title =
            (await new TextTemplate<DialogStateManager>(this.title.expressionText).bind(dc, dc.state)) ??
            this.title.getValue(dc.state);

        if (title?.startsWith('=')) {
            title = Expression.parse(title).tryEvaluate(dc.state)?.value;
        }

        let text =
            (await new TextTemplate<DialogStateManager>(this.text.expressionText).bind(dc, dc.state)) ??
            this.text.getValue(dc.state);

        if (text?.startsWith('=')) {
            text = Expression.parse(text).tryEvaluate(dc.state)?.value;
        }

        const settings: OAuthPromptSettings = {
            connectionName: this.connectionName?.getValue(dc.state),
            title,
            text,
        };

        // Send OAuthCard to root bot. The root bot could attempt to do a token exchange or if it cannot do token
        // exchange for this connection it will let the card get to the user to allow them to sign in.
        return OAuthPrompt.sendOAuthCard(settings, dc.context, prompt);
    }

    private async recognizeToken(dc: DialogContext): Promise<PromptRecognizerResult<TokenResponse>> {
        return new OAuthPrompt(this.constructor.name, {
            title: undefined,
            connectionName: this.connectionName.getValue(dc.state),
        }).recognizeToken(dc);
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
        if (Object.hasOwnProperty.call(obj, 'token')) {
            return true;
        }
        return false;
    }

    private async sendInvokeResponse(turnContext: TurnContext, status: StatusCodes, body?: object): Promise<void> {
        await turnContext.sendActivity({
            type: 'invokeResponse',
            value: {
                status,
                body,
            },
        });
    }
}

interface OAuthPromptState {
    state: any;
    options: PromptOptions;
    expires: number; // Timestamp of when the prompt will timeout.
}
