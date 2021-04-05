/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    BoolExpression,
    EnumExpression,
    EnumExpressionConverter,
    Expression,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';
import { Activity, AttachmentLayout, MessagingExtensionResult, StringUtils } from 'botbuilder';
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

export interface SendMEAttachmentsResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    property?: string | Expression | StringExpression;
    attachments?: TemplateInterface<Activity, DialogStateManager>;
    attachmentLayout?: string | Expression | EnumExpression<AttachmentLayout>;
}

/**
 * Send a messaging extension 'result' response when a Teams Invoke Activity is received with activity.name='composeExtension/queryLink'.
 */
export class SendMEAttachmentsResponse
    extends BaseTeamsCacheInfoResponseDialog
    implements SendMEAttachmentsResponseConfiguration {
    /**
     * Class identifier.
     */
    static $kind = 'Teams.SendMEAttachmentsResponse';

    /**
     * Gets or sets the Activity containing the Attachments to send.
     */
    public attachments?: TemplateInterface<Activity, DialogStateManager>;

    /**
     * Gets or sets the Attachment Layout type for the response ('grid' or 'list').
     *
     * @default
     * list
     */
    public attachmentLayout: EnumExpression<AttachmentLayout> = new EnumExpression('list');

    public getConverter(property: keyof SendMEAttachmentsResponseConfiguration): Converter | ConverterFactory {
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
     * @param {object} _options Optional, initial information to pass to the dialog.
     * @returns {Promise<DialogTurnResult>} A promise representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, _options?: Record<string, unknown>): Promise<DialogTurnResult> {
        if (this.disabled?.getValue(dc.state)) {
            return dc.endDialog();
        }

        const activity = await this.attachments?.bind(dc, dc.state);

        if (!activity?.attachments?.length) {
            throw new Error(`Missing attachments in ${SendMEAttachmentsResponse.$kind}.`);
        }

        const layout = this.attachmentLayout?.getValue(dc.state);

        const result: MessagingExtensionResult = {
            type: 'result',
            attachmentLayout: layout,
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
        return `SendMEAttachmentsResponse[\
            ${StringUtils.ellipsisHash(this.attachments?.toString() ?? '', 20)}\
        ]`;
    }
}
