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
import { TaskModuleResponse } from 'botbuilder';
import { Converter, ConverterFactory, DialogConfiguration, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { languageGeneratorKey } from 'botbuilder-dialogs-adaptive';
import { getValue } from './actionHelpers';
import { BaseTeamsCacheInfoResponseDialog } from './baseTeamsCacheInfoResponseDialog';

export interface SendTaskModuleMessageResponseConfiguration extends DialogConfiguration {
    disabled?: boolean | string | BoolExpression;
    message?: string | Expression | StringExpression;
}

/**
 * Send a simple message task module response.
 */
export class SendTaskModuleMessageResponse
    extends BaseTeamsCacheInfoResponseDialog
    implements SendTaskModuleMessageResponseConfiguration {
    /**
     * Class identifier.
     */
    static $kind = 'Teams.SendTaskModuleMessageResponse';

    /**
     * Gets or sets the template or text to use to generate the response message to send.
     */
    public message?: StringExpression;

    public getConverter(property: keyof SendTaskModuleMessageResponseConfiguration): Converter | ConverterFactory {
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

        let message = getValue(dc, this.message);

        if (!message) {
            const languageGenerator = dc.services.get(languageGeneratorKey);
            if (languageGenerator) {
                const lgStringResult = await languageGenerator.generate(dc, message, dc.state);
                message = lgStringResult.toString();
            }
        }

        const response: TaskModuleResponse = {
            task: {
                type: 'message',
                value: message,
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
        return `SendTaskModuleMessageResponse[\
            ${this.message?.toString() ?? ''}\
        ]`;
    }
}
