/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpression, Expression, StringExpression, StringExpressionConverter } from 'adaptive-expressions';
import { Activity, MessagingExtensionActionResponse } from 'botbuilder';
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
import { getComputeId } from './actionHelpers';
import { BaseSendTaskModuleContinueResponse } from './baseSendTaskModuleContinueResponse';
import { BaseTeamsCacheInfoResponseDialog } from './baseTeamsCacheInfoResponseDialog';

export interface SendMessagingExtensionActionResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    property?: string | Expression | StringExpression;
    card?: TemplateInterface<Activity, DialogStateManager>;
}

/**
 * Send a messaging extension 'result' response when a Teams Invoke Activity is received with activity.name='composeExtension/queryLink'.
 */
export class SendMessagingExtensionActionResponse
    extends BaseSendTaskModuleContinueResponse
    implements SendMessagingExtensionActionResponseConfiguration {
    /**
     * Class identifier.
     */
    public static $kind = 'Teams.SendMessagingExtensionActionResponse';

    /**
     * Gets or sets template for the attachment template of a Thumbnail or Hero Card to send.
     */
    public card: TemplateInterface<Activity, DialogStateManager>;

    public getConverter(
        property: keyof SendMessagingExtensionActionResponseConfiguration
    ): Converter | ConverterFactory {
        switch (property) {
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
        if (this.disabled?.getValue(dc.state)) {
            return dc.endDialog();
        }

        let activity;
        if (this.card != null) {
            activity = await this.card.bind(dc, dc.state);
        }

        const [attachment] = activity?.attachments ?? [];

        if (!attachment) {
            throw new Error(`Missing attachments in ${SendMessagingExtensionActionResponse.$kind}.`);
        }

        const title = this.title?.getValue(dc.state);
        const height = this.height?.getValue(dc.state);
        const width = this.width?.getValue(dc.state);
        const completionBotId = this.completionBotId?.getValue(dc.state);

        const response: MessagingExtensionActionResponse = {
            task: {
                value: {
                    card: attachment,
                    height,
                    width,
                    title,
                    completionBotId,
                },
            },
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
        return getComputeId('SendMessagingExtensionActionResponse', [this.card]);
    }
}
