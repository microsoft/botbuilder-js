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
    EnumExpression,
    EnumExpressionConverter,
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
import { BaseSendTaskModuleContinueResponse } from './baseSendTaskModuleContinueResponse';
import { BaseTeamsCacheInfoResponseDialog } from './baseTeamsCacheInfoResponseDialog';
import { MessagingExtensionAttachmentLayoutResponseType } from './messagingExtensionAttachmentLayoutResponseType';
import { MessagingExtensionResultResponseType } from './messagingExtensionResultResponseType';

export interface SendMessagingExtensionAttachmentsResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    property?: string | Expression | StringExpression;
    attachments?: TemplateInterface<Activity, DialogStateManager>;
    attachmentLayout?: string | Expression | EnumExpression<MessagingExtensionAttachmentLayoutResponseType>;
}

/**
 * Send a messaging extension 'result' response when a Teams Invoke Activity is received with activity.name='composeExtension/queryLink'.
 */
export class SendMessagingExtensionAttachmentsResponse
    extends BaseTeamsCacheInfoResponseDialog
    implements SendMessagingExtensionAttachmentsResponseConfiguration {
    /**
     * Class identifier.
     */
    public static $kind = 'Teams.SendMessagingExtensionAttachmentsResponse';

    /**
     * Gets or sets the Activity containing the Attachments to send.
     */
    public attachments: TemplateInterface<Activity, DialogStateManager>;

    /**
     * Gets or sets the Attachment Layout type for the response ('grid' or 'list').
     *
     * @default
     * list
     */
    public attachmentLayout: EnumExpression<MessagingExtensionAttachmentLayoutResponseType> = new EnumExpression(
        MessagingExtensionAttachmentLayoutResponseType.list
    );

    public getConverter(
        property: keyof SendMessagingExtensionAttachmentsResponseConfiguration
    ): Converter | ConverterFactory {
        switch (property) {
            case 'property':
                return new StringExpressionConverter();
            case 'attachments':
                return new ActivityTemplateConverter();
            case 'attachmentLayout':
                return new EnumExpressionConverter(this.attachmentLayout);
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

        let activity;
        if (this.attachments != null) {
            activity = await this.attachments.bind(dc, dc.state);
        }

        if (!activity?.attachments) {
            throw new Error('Missing attachments in Messaging Extension Attachments Response');
        }

        const layout = this.attachmentLayout?.getValue(dc.state);

        const result = <MessagingExtensionResult>{
            type: MessagingExtensionResultResponseType.result.toString(),
            attachmentLayout: layout.toString(),
            attachments: activity.attachments,
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
        return `SendMessagingExtensionAttachmentsResponse[
            ${this.attachments?.toString() ?? ''}
        ]`;
    }
}
