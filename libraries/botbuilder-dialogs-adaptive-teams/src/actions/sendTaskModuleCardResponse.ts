/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpression, BoolExpressionConverter, EnumExpression } from 'adaptive-expressions';
import { Activity, Attachment, TaskModuleContinueResponse, TaskModuleResponse, TaskModuleTaskInfo } from 'botbuilder';
import {
    Converter,
    ConverterFactory,
    DialogConfiguration,
    DialogContext,
    DialogStateManager,
    DialogTurnResult,
    TemplateInterface,
} from 'botbuilder-dialogs';
import { BaseSendTaskModuleContinueResponse } from './baseSendTaskModuleContinueResponse';
import { BaseTeamsCacheInfoResponseDialog } from './baseTeamsCacheInfoResponseDialog';
import { MessagingExtensionAttachmentLayoutResponseType } from './MessagingExtensionAttachmentLayoutResponseType';

export interface SendTaskModuleCardResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    card?: TemplateInterface<Activity, DialogStateManager>;
}

/**
 * Send a messaging extension 'message' response.
 */
export class SendTaskModuleCardResponse
    extends BaseSendTaskModuleContinueResponse
    implements SendTaskModuleCardResponseConfiguration {
    /**
     * Class identifier.
     */
    public static $kind = 'Teams.SendTaskModuleCardResponse';

    /**
     * Gets or sets template for the attachment template of a Thumbnail or Hero Card to send.
     */
    public card: TemplateInterface<Activity, DialogStateManager>;

    public getConverter(property: keyof SendTaskModuleCardResponseConfiguration): Converter | ConverterFactory {
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

        let attachment;
        if (this.card != null) {
            const boundActivity = await this.card.bind(dc, dc.state);

            if (!boundActivity.attachments) {
                throw new Error(
                    'Invalid activity. The activity does not contain a valid attachment as required for Task Module Card Response.'
                );
            }

            attachment = boundActivity.attachments[0] as Attachment;
        } else {
            throw new Error('A valid card is required for Task Module Card Response');
        }

        const title = this.title?.getValue(dc.state);
        const height = this.height?.getValue(dc.state);
        const width = this.width?.getValue(dc.state);
        const completionBotId = this.completionBotId?.getValue(dc.state);

        const response = <TaskModuleResponse>{
            task: <TaskModuleContinueResponse>{
                value: <TaskModuleTaskInfo>{
                    card: attachment,
                    height,
                    width,
                    title,
                    completionBotId,
                },
            },
            cacheInfo: this.getCacheInfo(dc),
        };

        const responseActivity = BaseTeamsCacheInfoResponseDialog.createInvokeResponseActivity(response);
        const sendResponse = await dc.context.sendActivity(responseActivity);

        return dc.endDialog(sendResponse);
    }

    /**
     * Builds the compute Id for the dialog.
     *
     * @returns {string} A string representing the compute Id.
     */
    protected onComputeId(): string {
        return `SendTaskModuleCardResponse[
            ${this.card?.toString() ?? ''}
        ]`;
    }
}
