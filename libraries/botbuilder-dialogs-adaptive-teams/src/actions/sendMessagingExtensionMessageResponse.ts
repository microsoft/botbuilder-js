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
import { MessagingExtensionResponse, MessagingExtensionResult } from 'botbuilder';
import { Converter, ConverterFactory, DialogConfiguration, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { BaseTeamsCacheInfoResponseDialog } from './baseTeamsCacheInfoResponseDialog';
import { MessagingExtensionResultResponseType } from './MessagingExtensionResultResponseType';

export interface SendMessagingExtensionMessageResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    message?: string | Expression | StringExpression;
}

/**
 * Send a messaging extension 'message' response.
 */
export class SendMessagingExtensionMessageResponse
    extends BaseTeamsCacheInfoResponseDialog
    implements SendMessagingExtensionMessageResponseConfiguration {
    /**
     * Class identifier.
     */
    public static $kind = 'Teams.SendMessagingExtensionMessageResponse';

    /**
     * Gets or sets the template or text to use to generate the response message to send.
     */
    public message: StringExpression;

    public getConverter(
        property: keyof SendMessagingExtensionMessageResponseConfiguration
    ): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'message':
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

        const message = this.message?.getValue(dc.state);

        const response = <MessagingExtensionResponse>{
            composeExtension: <MessagingExtensionResult>{
                type: MessagingExtensionResultResponseType.config.toString(),
                text: message,
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
        return `SendMessagingExtensionMessageResponse[
            ${this.message?.toString() ?? ''}
        ]`;
    }
}
