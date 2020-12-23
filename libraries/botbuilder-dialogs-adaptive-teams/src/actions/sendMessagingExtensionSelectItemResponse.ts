/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpression, BoolExpressionConverter, EnumExpression } from 'adaptive-expressions';
import { Activity, Attachment, MessagingExtensionAttachment, MessagingExtensionResult } from 'botbuilder';
import {
    Converter,
    ConverterFactory,
    DialogConfiguration,
    DialogContext,
    DialogStateManager,
    DialogTurnResult,
    TemplateInterface,
} from 'botbuilder-dialogs';
import { BaseTeamsCacheInfoResponseDialog } from './baseTeamsCacheInfoResponseDialog';
import { MessagingExtensionAttachmentLayoutResponseType } from './MessagingExtensionAttachmentLayoutResponseType';
import { MessagingExtensionResultResponseType } from './MessagingExtensionResultResponseType';

export interface SendMessagingExtensionSelectItemResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    card?: TemplateInterface<Activity, DialogStateManager>;
}

/**
 * Send a messaging extension response when an item is selected.
 */
export class SendMessagingExtensionSelectItemResponse
    extends BaseTeamsCacheInfoResponseDialog
    implements SendMessagingExtensionSelectItemResponseConfiguration {
    /**
     * Class identifier.
     */
    public static $kind = 'Teams.SendMessagingExtensionSelectItemResponse';

    /**
     * Gets or sets template for the attachment template of a Thumbnail or Hero Card to send.
     */
    public card: TemplateInterface<Activity, DialogStateManager>;

    public getConverter(
        property: keyof SendMessagingExtensionSelectItemResponseConfiguration
    ): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
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

        const boundActivity = await this.card.bind(dc, dc.state);

        if (!boundActivity.attachments) {
            throw new Error(
                `Invalid activity. A valid attachment is required for ${SendMessagingExtensionSelectItemResponse.$kind} .`
            );
        }

        const attachment = boundActivity.attachments[0] as Attachment;
        const extensionAttachment = <MessagingExtensionAttachment>{
            contentType: attachment.contentType,
            content: attachment.content,
        };

        const response = <MessagingExtensionResult>{
            type: MessagingExtensionResultResponseType.result.toString(),
            attachmentLayout: MessagingExtensionAttachmentLayoutResponseType.list.toString(),
            attachments: [extensionAttachment],
        };

        const invokeResponse = this.createMessagingExtensionInvokeResponseActivity(dc, response);
        const sendResponse = await dc.context.sendActivity(invokeResponse);

        return dc.endDialog(sendResponse);
    }

    /**
     * Builds the compute Id for the dialog.
     *
     * @returns {string} A string representing the compute Id.
     */
    protected onComputeId(): string {
        return `SendMessagingExtensionSelectItemResponse[
            ${this.card?.toString() ?? ''}
        ]`;
    }
}
