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
    BotAdapter,
    BotFrameworkAdapter,
    MessagingExtensionResult,
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
import { Test, tests } from 'botbuilder-stdlib';
import { isEmpty } from 'lodash';

export interface SendMessagingExtensionAuthResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    property?: string | Expression | StringExpression;
    connectionName?: string | Expression | StringExpression;
    title?: string | Expression | StringExpression;
}

// dc.context.adapter is typed as a BotAdapter, not containing getUserToken and getSignInLink. However, both
// BotFrameworkAdapter and TestAdapter contain them, so we just need to make sure that dc.context.adapter contains
// an adapter with the appropriate auth methods.
interface HasAuthMethods {
    getUserToken: typeof BotFrameworkAdapter.prototype.getUserToken;
    getSignInLink: typeof BotFrameworkAdapter.prototype.getSignInLink;
}
const testAdapterHasAuthMethods: Test<HasAuthMethods> = (val: unknown): val is HasAuthMethods => {
    return (
        val instanceof BotFrameworkAdapter ||
        (tests.isFunc((val as BotFrameworkAdapter).getUserToken) &&
            tests.isFunc((val as BotFrameworkAdapter).getSignInLink))
    );
};

/**
 * Send a messaging extension 'result' response when a Teams Invoke Activity is received with activity.name='composeExtension/queryLink'.
 */
export class SendMessagingExtensionAuthResponse
    extends BaseSendTaskModuleContinueResponse
    implements SendMessagingExtensionAuthResponseConfiguration {
    /**
     * Class identifier.
     */
    public static readonly $kind = 'Teams.SendMessagingExtensionAuthResponse';

    /**
     * Gets or sets property path to put the value in.
     */
    public property?: StringExpression;

    /**
     * Gets or sets the name of the OAuth connection.
     */
    public connectionName?: StringExpression;

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
     * @param {object} _options Optional, initial information to pass to the dialog.
     * @returns {Promise<DialogTurnResult>} A promise representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, _options?: Record<string, unknown>): Promise<DialogTurnResult> {
        if (this.disabled?.getValue(dc.state)) {
            return dc.endDialog();
        }

        if (!testAdapterHasAuthMethods(dc.context.adapter)) {
            throw new Error(`${SendMessagingExtensionAuthResponse.$kind}: not supported by the current adapter.`);
        }

        const connectionName = this.connectionName?.getValue(dc.state);
        if (!connectionName) {
            throw new Error(`A valid ConnectionName is required for ${SendMessagingExtensionAuthResponse.$kind}.`);
        }

        const title = this.title?.getValue(dc.state);
        if (!title) {
            throw new Error(`A valid Title is required for ${SendMessagingExtensionAuthResponse.$kind}.`);
        }

        const tokenResponse = await SendMessagingExtensionAuthResponse.getUserToken(
            dc,
            dc.context.adapter,
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
        const activity = await this.getInvokeResponseWithSignInLink(dc, title, dc.context.adapter, connectionName);
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
        return `SendMessagingExtensionAuthResponse[\
            ${this.title?.toString() ?? ''}\
        ]`;
    }

    private static async getUserToken(
        dc: DialogContext,
        tokenProvider: BotAdapter & HasAuthMethods,
        connectionName: string
    ): Promise<TokenResponse> {
        const magicCode = !isEmpty(dc.context.activity?.value) ? dc.context.activity.value.state : undefined;

        // TODO: SSO and skills token exchange
        return tokenProvider.getUserToken(dc.context, connectionName, magicCode);
    }

    private async getInvokeResponseWithSignInLink(
        dc: DialogContext,
        title: string,
        tokenProvider: BotAdapter & HasAuthMethods,
        connectionName: string
    ): Promise<Partial<Activity>> {
        const signInLink = await tokenProvider.getSignInLink(dc.context, connectionName);

        const result: MessagingExtensionResult = {
            type: 'auth',
            suggestedActions: {
                actions: [
                    {
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
