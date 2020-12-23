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
    CardAction,
    MessagingExtensionResponse,
    MessagingExtensionResult,
    MessagingExtensionSuggestedAction,
} from 'botbuilder';
import { Converter, ConverterFactory, DialogConfiguration, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { BaseTeamsCacheInfoResponseDialog } from './baseTeamsCacheInfoResponseDialog';
import { MessagingExtensionResultResponseType } from './MessagingExtensionResultResponseType';

export interface SendMessagingExtensionConfigQuerySettingUrlResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    configUrl?: string | Expression | StringExpression;
}

/**
 * Send a messaging extension 'config' response. This is the type of response used for a 'composeExtension/querySettingUrl' request.
 */
export class SendMessagingExtensionConfigQuerySettingUrlResponse
    extends BaseTeamsCacheInfoResponseDialog
    implements SendMessagingExtensionConfigQuerySettingUrlResponseConfiguration {
    /**
     * Class identifier.
     */
    public static $kind = 'Teams.SendMessagingExtensionConfigQuerySettingUrlResponse';

    /**
     * Gets or sets config url response to send.
     *
     * @example
     * `${config.siteUrl}/searchSettings.html?settings=${escapedSettings}`.
     */
    public configUrl: StringExpression;

    public getConverter(
        property: keyof SendMessagingExtensionConfigQuerySettingUrlResponseConfiguration
    ): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'configUrl':
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
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return dc.endDialog();
        }

        const configUrl = this.configUrl?.getValue(dc.state);
        if (!configUrl) {
            throw new Error('configUrl is required for a Messaging Extension Config Response');
        }

        const response = <MessagingExtensionResponse>{
            composeExtension: <MessagingExtensionResult>{
                type: MessagingExtensionResultResponseType.config.toString(),
                suggestedActions: <MessagingExtensionSuggestedAction>{
                    actions: [
                        <CardAction>{
                            type: ActionTypes.OpenUrl,
                            value: configUrl,
                        },
                    ],
                },
            },
            cacheInfo: this.getCacheInfo(dc),
        };

        const invokeResponse = BaseTeamsCacheInfoResponseDialog.createInvokeResponseActivity(response);
        const resourceResponse = await dc.context.sendActivity(invokeResponse);

        return dc.endDialog(resourceResponse);
    }

    /**
     * Builds the compute Id for the dialog.
     *
     * @returns {string} A string representing the compute Id.
     */
    protected onComputeId(): string {
        return `SendMessagingExtensionConfigQuerySettingUrlResponse[
            ${this.configUrl?.toString() ?? ''}
        ]`;
    }
}
