/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import isEmpty from 'lodash/isEmpty';
import { ActionTypes, Activity, CardAction, TokenResponse } from 'botbuilder';
import { BoolExpressionConverter, Expression, StringExpression, StringExpressionConverter } from 'adaptive-expressions';
import { Converter, ConverterFactory, Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { getValue, testAdapterHasAuthMethods } from './actionHelpers';

import {
    BaseTeamsCacheInfoResponseDialog,
    BaseTeamsCacheInfoResponseDialogConfiguration,
} from './baseTeamsCacheInfoResponseDialog';

export interface BaseAuthResponseDialogConfiguration extends BaseTeamsCacheInfoResponseDialogConfiguration {
    property?: string | Expression | StringExpression;
    connectionName?: string | Expression | StringExpression;
    title?: string | Expression | StringExpression;
}

/**
 * Base type for auth response dialogs.
 */
export abstract class BaseAuthResponseDialog
    extends BaseTeamsCacheInfoResponseDialog
    implements BaseAuthResponseDialogConfiguration {
    /**
     * Gets or sets property path to put the TokenResponse value in once retrieved.
     */
    public property?: StringExpression;

    /**
     * Gets or sets the name of the OAuth connection.
     */
    public connectionName?: StringExpression;

    /**
     * Gets or sets the response title.
     */
    public title?: StringExpression;

    public getConverter(property: keyof BaseAuthResponseDialogConfiguration | string): Converter | ConverterFactory {
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
     * @param {DialogContext} dc The DialogContext for the turn of conversation.
     * @param {Record<string,any>} _options Optional, initial information to pass to the dialog.
     * @returns {Promise<DialogTurnResult>} Promise representing the DialogTurnResult.
     */
    public async beginDialog(dc: DialogContext, _options: Record<string, unknown>): Promise<DialogTurnResult> {
        if (this.disabled?.getValue(dc.state) === true) {
            return dc.endDialog();
        }

        const connectionName = getValue(dc, this.connectionName);
        if (!connectionName) {
            throw new Error('A valid ConnectionName is required for auth responses.');
        }

        const title = getValue(dc, this.title);
        if (!title) {
            throw new Error('A valid Title is required for auth responses.');
        }

        const tokenResponse = await BaseAuthResponseDialog.getUserToken(dc, connectionName);
        if (tokenResponse) {
            // We have the token, so the user is already signed in.
            // Similar to OAuthInput, just return the token in the property.
            if (this.property != null) {
                dc.state.setValue(this.property?.getValue(dc.state), tokenResponse);
            }

            // End the dialog and return the token response.
            return dc.endDialog(tokenResponse);
        }

        // There is no token, so the user has not signed in yet.
        const activity = await this.createOAuthInvokeResponseActivityFromTitleAndConnectionName(
            dc,
            title,
            connectionName
        );
        await dc.context.sendActivity(activity);

        // Since the token was not retrieved above, end the turn.
        return Dialog.EndOfTurn;
    }

    // eslint-disable-next-line jsdoc/require-returns-check
    /**
     * Create a type specific Auth Response using the provided CardAction.
     *
     * @param {DialogContext} _dc Current DialogContext.
     * @param {CardAction} _cardAction CardAction with a valid Sign In Link.
     * @returns {Partial<Activity>} Promise representing the InvokeResponse Activity specific to this type of auth dialog.
     */
    protected createOAuthInvokeResponseActivityFromCardAction(
        _dc: DialogContext,
        _cardAction: CardAction
    ): Partial<Activity> {
        throw new Error('NotImplemented');
    }

    private async createOAuthInvokeResponseActivityFromTitleAndConnectionName(
        dc: DialogContext,
        title?: string,
        connectionName?: string
    ): Promise<Partial<Activity>> {
        // TODO: Switch to using Cloud OAuth after this PR gets merged: https://github.com/microsoft/botbuilder-js/pull/3149
        if (!testAdapterHasAuthMethods(dc.context.adapter)) {
            throw new Error('Auth is not supported by the current adapter.');
        } else if (!title || !connectionName) {
            throw new Error('title and connectionName are required.');
        }

        const signInLink = await dc.context.adapter.getSignInLink(dc.context, connectionName);
        return this.createOAuthInvokeResponseActivityFromTitleAndSignInLink(dc, title, signInLink);
    }

    private async createOAuthInvokeResponseActivityFromTitleAndSignInLink(
        dc: DialogContext,
        title: string,
        signInLink: string
    ): Promise<Partial<Activity>> {
        const signInAction: CardAction = {
            type: ActionTypes.OpenUrl,
            value: signInLink,
            title,
        };

        return this.createOAuthInvokeResponseActivityFromCardAction(dc, signInAction);
    }

    private static async getUserToken(dc: DialogContext, connectionName: string): Promise<TokenResponse> {
        // TODO: Switch to using Cloud OAuth after this PR gets merged: https://github.com/microsoft/botbuilder-js/pull/3149
        if (!testAdapterHasAuthMethods(dc.context.adapter)) {
            throw new Error('Auth is not supported by the current adapter.');
        }

        // When the Bot Service Auth flow completes, the action.State will contain a magic code used for verification.
        const magicCode = !isEmpty(dc.context.activity?.value) ? dc.context.activity.value.state : undefined;

        // TODO: SSO and skills token exchange.
        return dc.context.adapter.getUserToken(dc.context, connectionName, magicCode);
    }
}
