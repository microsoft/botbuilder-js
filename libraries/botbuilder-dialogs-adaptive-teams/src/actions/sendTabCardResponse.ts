/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpressionConverter, StringExpressionConverter } from 'adaptive-expressions';
import { Activity, ActivityTypes, InvokeResponse, StatusCodes, TabResponse, TabResponseCard } from 'botbuilder';
import {
    Converter,
    ConverterFactory,
    DialogContext,
    DialogStateManager,
    DialogTurnResult,
    TemplateInterface,
} from 'botbuilder-dialogs';
import { ActivityTemplateConverter } from 'botbuilder-dialogs-adaptive/lib/converters';
import { BaseAuthResponseDialog, BaseAuthResponseDialogConfiguration } from './baseAuthResponseDialog';

export interface SendTabCardResponseConfiguration extends BaseAuthResponseDialogConfiguration {
    cards?: TemplateInterface<Activity, DialogStateManager>;
}

/**
 * Send a Card Tab response to the user.
 */
export class SendTabCardResponse extends BaseAuthResponseDialog implements BaseAuthResponseDialogConfiguration {
    /**
     * Class identifier.
     */
    public static $kind = 'Teams.SendTabCardResponse';

    /**
     * Template for the activity expression containing Adaptive Cards to send.
     */
    public cards?: TemplateInterface<Activity, DialogStateManager>;

    public getConverter(property: keyof BaseAuthResponseDialogConfiguration | string): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'property':
            case 'connectionName':
            case 'title':
                return new StringExpressionConverter();
            case 'cards':
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

        if (!this.cards) {
            throw new Error(`Valid Cards are required for ${SendTabCardResponse.$kind}.`);
        }

        const activity = await this.cards?.bind(dc, dc.state);

        if (!activity?.attachments?.length) {
            throw new Error(`Invalid activity. Attachment(s) are required for ${SendTabCardResponse.$kind}.`);
        }

        const cards = activity.attachments.map(
            (attachment): TabResponseCard => {
                return {
                    card: attachment.content,
                };
            }
        );
        const responseActivity = this.getTabInvokeResponse(cards);

        const sendResponse = await dc.context.sendActivity(responseActivity);
        return dc.endDialog(sendResponse);
    }

    /**
     * Builds the compute Id for the dialog.
     *
     * @returns {string} A string representing the compute Id.
     */
    protected onComputeId(): string {
        return `SendTabCardResponse[\
            ${this.title?.toString() ?? ''}\
        ]`;
    }

    private getTabInvokeResponse(cards: TabResponseCard[]): Partial<Activity> {
        return {
            value: <InvokeResponse>{
                status: StatusCodes.OK,
                body: <TabResponse>{
                    tab: {
                        type: 'continue',
                        value: {
                            cards,
                        },
                    },
                },
            },
            type: ActivityTypes.InvokeResponse,
        };
    }
}
