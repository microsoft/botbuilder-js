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
import { StringUtils, TaskModuleResponse } from 'botbuilder';
import { Converter, ConverterFactory, DialogConfiguration, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { BaseSendTaskModuleContinueResponse } from './baseSendTaskModuleContinueResponse';
import { BaseTeamsCacheInfoResponseDialog } from './baseTeamsCacheInfoResponseDialog';

export interface SendTaskModuleUrlResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    url?: string | Expression | StringExpression;
    fallbackUrl?: string | Expression | StringExpression;
}

/**
 * Send a simple message task module response.
 */
export class SendTaskModuleUrlResponse
    extends BaseSendTaskModuleContinueResponse
    implements SendTaskModuleUrlResponseConfiguration {
    /**
     * Class identifier.
     */
    static $kind = 'Teams.SendTaskModuleUrlResponse';

    /**
     * Gets or sets an optional expression for the Url of the Task Module response.
     */
    public url?: StringExpression;

    /**
     * Gets or sets an optional expression for the Fallback Url the Task Module Task Info response.
     */
    public fallbackUrl?: StringExpression;

    public getConverter(property: keyof SendTaskModuleUrlResponseConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'url':
            case 'fallbackUrl':
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

        const url = this.url?.getValue(dc.state);
        if (!url) {
            throw new Error(`Missing Url for ${SendTaskModuleUrlResponse.$kind}.`);
        }

        const title = this.title?.getValue(dc.state);
        const height = this.height?.getValue(dc.state);
        const width = this.width?.getValue(dc.state);
        const completionBotId = this.completionBotId?.getValue(dc.state);
        const fallbackUrl = this.fallbackUrl?.getValue(dc.state);

        const response: TaskModuleResponse = {
            task: {
                type: 'continue',
                value: {
                    height,
                    width,
                    title,
                    completionBotId,
                    url: encodeURI(url),
                    fallbackUrl: encodeURI(fallbackUrl || ''),
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
        return `SendTaskModuleUrlResponse[\
            ${StringUtils.ellipsis(this.url?.toString() ?? '', 20)},\
            ${this.title?.toString() ?? ''}\
        ]`;
    }
}
