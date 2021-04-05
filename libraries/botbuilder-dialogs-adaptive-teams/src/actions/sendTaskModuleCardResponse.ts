/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpression, BoolExpressionConverter } from 'adaptive-expressions';
import { Activity, StringUtils, TaskModuleResponse } from 'botbuilder';
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
    static $kind = 'Teams.SendTaskModuleCardResponse';

    /**
     * Gets or sets template for the attachment template of a Thumbnail or Hero Card to send.
     */
    public card?: TemplateInterface<Activity, DialogStateManager>;

    public getConverter(property: keyof SendTaskModuleCardResponseConfiguration): Converter | ConverterFactory {
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
            throw new Error(`A valid Card is required for ${SendTaskModuleCardResponse.$kind}.`);
        }

        const activity = await this.card.bind(dc, dc.state);

        const [attachment] = activity?.attachments ?? [];
        if (!attachment) {
            throw new Error(`Invalid activity. An attachment is required for ${SendTaskModuleCardResponse.$kind}.`);
        }

        const title = this.title?.getValue(dc.state);
        const height = this.height?.getValue(dc.state);
        const width = this.width?.getValue(dc.state);
        const completionBotId = this.completionBotId?.getValue(dc.state);

        const response: TaskModuleResponse = {
            task: {
                type: 'continue',
                value: {
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
        return `SendTaskModuleCardResponse[\
            ${StringUtils.ellipsisHash(this.card?.toString() ?? '', 20)}\
        ]`;
    }
}
