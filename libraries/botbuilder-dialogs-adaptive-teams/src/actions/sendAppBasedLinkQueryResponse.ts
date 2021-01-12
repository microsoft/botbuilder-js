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
import { Activity, MessagingExtensionResult } from 'botbuilder';
import {
    Converter,
    ConverterFactory,
    DialogConfiguration,
    DialogContext,
    DialogStateManager,
    DialogTurnResult,
    TemplateInterface,
} from 'botbuilder-dialogs';
import { ActivityTemplateConverter } from 'botbuilder-dialogs-adaptive/lib/converters';
import { BaseTeamsCacheInfoResponseDialog } from './baseTeamsCacheInfoResponseDialog';

export interface SendAppBasedLinkQueryResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    property?: string | Expression | StringExpression;
    card?: TemplateInterface<Activity, DialogStateManager>;
}

/**
 * Send a messaging extension 'result' response when a Teams Invoke Activity is received with activity.name='composeExtension/queryLink'.
 */
export class SendAppBasedLinkQueryResponse
    extends BaseTeamsCacheInfoResponseDialog
    implements SendAppBasedLinkQueryResponseConfiguration {
    /**
     * Class identifier.
     */
    public static $kind = 'Teams.SendAppBasedLinkQueryResponse';

    /**
     * Gets or sets template for the attachment template of a Thumbnail or Hero Card to send.
     */
    public card: TemplateInterface<Activity, DialogStateManager>;

    public getConverter(property: keyof SendAppBasedLinkQueryResponseConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'property':
                return new StringExpressionConverter();
            case 'card':
                return new ActivityTemplateConverter();
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

        let boundActivity;
        if (this.card != null) {
            boundActivity = await this.card.bind(dc, dc.state);

            if (!boundActivity.attachments) {
                throw new Error(
                    'Invalid activity. An attachment is required for Send Messaging Extension Link Query Response.'
                );
            }
        } else {
            throw new Error(
                'An activity with attachments is required for Send Messaging Extension Link Query Response.'
            );
        }

        const result = <MessagingExtensionResult>{
            type: 'result',
            attachmentLayout: 'list',
            attachments: boundActivity.attachments,
        };

        const invokeResponse = this.createMessagingExtensionInvokeResponseActivity(dc, result);
        const resourceResponse = await dc.context.sendActivity(invokeResponse);

        return dc.endDialog(resourceResponse);
    }

    /**
     * Builds the compute Id for the dialog.
     *
     * @returns {string} A string representing the compute Id.
     */
    protected onComputeId(): string {
        return `SendAppBasedLinkQueryResponse[
            ${this.card?.toString() ?? ''}
        ]`;
    }
}
