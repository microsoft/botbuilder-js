/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpression, BoolExpressionConverter } from 'adaptive-expressions';
import { Activity, MessagingExtensionAttachment, MessagingExtensionResult, StringUtils } from 'botbuilder';
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

export interface SendMESelectItemResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    card?: TemplateInterface<Activity, DialogStateManager>;
}

/**
 * Send a messaging extension response when an item is selected.
 */
export class SendMESelectItemResponse
    extends BaseTeamsCacheInfoResponseDialog
    implements SendMESelectItemResponseConfiguration {
    /**
     * Class identifier.
     */
    static $kind = 'Teams.SendMESelectItemResponse';

    /**
     * Gets or sets template for the attachment template of a Thumbnail or Hero Card to send.
     */
    public card?: TemplateInterface<Activity, DialogStateManager>;

    public getConverter(property: keyof SendMESelectItemResponseConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
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
     * @param {object} _options Optional, initial information to pass to the dialog.
     * @returns {Promise<DialogTurnResult>} A promise representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, _options?: Record<string, unknown>): Promise<DialogTurnResult> {
        if (this.disabled?.getValue(dc.state)) {
            return dc.endDialog();
        }

        if (!this.card) {
            throw new Error(`A valid card is required for ${SendMESelectItemResponse.$kind}.`);
        }

        const activity = await this.card.bind(dc, dc.state);

        const [attachment] = activity?.attachments ?? [];
        if (!attachment) {
            throw new Error(`Invalid activity. An attachment is required for ${SendMESelectItemResponse.$kind}.`);
        }

        const extensionAttachment: MessagingExtensionAttachment = {
            contentType: attachment.contentType,
            content: attachment.content,
        };

        const response: MessagingExtensionResult = {
            type: 'result',
            attachmentLayout: 'list',
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
        return `SendMESelectItemResponse[\
            ${StringUtils.ellipsisHash(this.card?.toString() ?? '', 20)}\
        ]`;
    }
}
