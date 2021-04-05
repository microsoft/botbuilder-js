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
import { MessagingExtensionResponse } from 'botbuilder';
import { Converter, ConverterFactory, DialogConfiguration, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { BaseTeamsCacheInfoResponseDialog } from './baseTeamsCacheInfoResponseDialog';

export interface SendMEMessageResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    message?: string | Expression | StringExpression;
}

/**
 * Send a messaging extension 'message' response.
 */
export class SendMEMessageResponse
    extends BaseTeamsCacheInfoResponseDialog
    implements SendMEMessageResponseConfiguration {
    /**
     * Class identifier.
     */
    static $kind = 'Teams.SendMEMessageResponse';

    /**
     * Gets or sets the template or text to use to generate the response message to send.
     */
    public message?: StringExpression;

    public getConverter(property: keyof SendMEMessageResponseConfiguration): Converter | ConverterFactory {
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
     * @param {object} _options Optional, initial information to pass to the dialog.
     * @returns {Promise<DialogTurnResult>} A promise representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, _options?: Record<string, unknown>): Promise<DialogTurnResult> {
        if (this.disabled?.getValue(dc.state)) {
            return dc.endDialog();
        }

        const message = this.message?.getValue(dc.state);

        if (!message) {
            throw new Error(`A Message is required for ${SendMEMessageResponse.$kind}.`);
        }

        const response: MessagingExtensionResponse = {
            composeExtension: {
                type: 'message',
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
        return `SendMEMessageResponse[\
            ${this.message?.toString() ?? ''}\
        ]`;
    }
}
