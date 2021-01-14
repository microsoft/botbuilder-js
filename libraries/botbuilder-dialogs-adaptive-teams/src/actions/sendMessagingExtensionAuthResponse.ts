/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';
import {
    ActionTypes,
    Activity,
    BotFrameworkAdapter,
    CardAction,
    ExtendedUserTokenProvider,
    MessagingExtensionResult,
    MessagingExtensionSuggestedAction,
    TokenResponse,
} from 'botbuilder';
import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';
import { BaseSendTaskModuleContinueResponse } from './baseSendTaskModuleContinueResponse';

export interface SendMessagingExtensionAuthResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    property?: string | Expression | StringExpression;
    connectionName?: string | Expression | StringExpression;
    title?: string | Expression | StringExpression;
}

/**
 * Send a messaging extension 'result' response when a Teams Invoke Activity is received with activity.name='composeExtension/queryLink'.
 */
export class SendMessagingExtensionAuthResponse
    extends BaseSendTaskModuleContinueResponse
    implements SendMessagingExtensionAuthResponseConfiguration {
    /**
     * Class identifier.
     */
    public static $kind = 'Teams.SendMessagingExtensionAuthResponse';

    /**
     * Gets or sets property path to put the value in.
     */
    public property: StringExpression;

    /**
     * Gets or sets the name of the OAuth connection.
     */
    public connectionName: StringExpression;

    /**
     * Gets or sets an Title of the response.
     */
    public title: StringExpression;

    public getConverter(property: keyof SendMessagingExtensionAuthResponseConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'property':
            case 'connectionName':
            case 'title':
                return new StringExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     *
     * @param {DialogContext} dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param {object} options Optional, initial information to pass to the dialog.
     * @returns {Promise<DialogTurnResult>} A promise representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: Record<string, unknown>): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled?.getValue(dc.state)) {
            return dc.endDialog();
        }

        // Type check that dc.context.adapter matches interface, ExtendedUserTokenProvider
        // eslint-disable-next-line no-prototype-builtins
        if (!(typeof (dc.context.adapter as BotFrameworkAdapter)?.getUserToken === 'function')) {
            throw new Error(`${SendMessagingExtensionAuthResponse.$kind}: not supported by the current adapter.`);
        }

        const connectionName = this.connectionName?.getValue(dc.state);
        if (!connectionName) {
            throw new Error(`${SendMessagingExtensionAuthResponse.$kind} requires a Connection Name.`);
        }

        const title = this.title?.getValue(dc.state);
        if (!title) {
            throw new Error(`${SendMessagingExtensionAuthResponse.$kind} requires a Title.`);
        }

        const tokenResponse = await SendMessagingExtensionAuthResponse.getUserToken(
            dc,
            (dc.context.adapter as unknown) as ExtendedUserTokenProvider,
            connectionName
        );
        if (!tokenResponse) {
            // We have the auth token, so the user is already signed in.
            // Similar to OAuthInput, just return the token in the property.
            if (this.property != null) {
                dc.state.setValue(this.property?.getValue(dc.state), tokenResponse);
            }

            // End the dialog and return the token response
            return dc.endDialog(tokenResponse);
        }

        // There is no token, so the user has not signed in yet.
        const activity = await this.getInvokeResponseWithSignInLink(
            dc,
            title,
            (dc.context.adapter as unknown) as ExtendedUserTokenProvider,
            connectionName
        );
        await dc.context.sendActivity(activity);

        // Since a token was not retrieved above, end the turn.
        return Dialog.EndOfTurn;
    }

    /**
     * Builds the compute Id for the dialog.
     *
     * @returns {string} A string representing the compute Id.
     */
    protected onComputeId(): string {
        return `${this.constructor.name}[
            ${this.title?.toString() ?? ''}
        ]`;
    }

    private static async getUserToken(
        dc: DialogContext,
        tokenProvider: ExtendedUserTokenProvider,
        connectionName: string
    ): Promise<TokenResponse> {
        let magicCode;
        if (Object.keys(dc.context.activity?.value || []).length) {
            magicCode = dc.context.activity.value.state;
        }

        // TODO: SSO and skills token exchange
        return tokenProvider.getUserToken(dc.context, connectionName, magicCode);
    }

    private async getInvokeResponseWithSignInLink(
        dc: DialogContext,
        title: string,
        tokenProvider: ExtendedUserTokenProvider,
        connectionName: string
    ): Promise<Activity> {
        const signInLink = await tokenProvider.getSignInLink(dc.context, connectionName);

        const result = <MessagingExtensionResult>{
            type: 'auth',
            suggestedActions: <MessagingExtensionSuggestedAction>{
                actions: [
                    <CardAction>{
                        type: ActionTypes.OpenUrl,
                        value: encodeURI(signInLink),
                        title,
                    },
                ],
            },
        };

        return this.createMessagingExtensionInvokeResponseActivity(dc, result);
    }
}
