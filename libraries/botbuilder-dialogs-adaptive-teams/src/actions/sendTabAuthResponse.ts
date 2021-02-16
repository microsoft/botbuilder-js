/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, CardAction, TabResponse, TabResponsePayload } from 'botbuilder';
import { DialogContext } from 'botbuilder-dialogs';
import { BaseAuthResponseDialog, BaseAuthResponseDialogConfiguration } from './baseAuthResponseDialog';
import { BaseTeamsCacheInfoResponseDialog } from './baseTeamsCacheInfoResponseDialog';

/**
 * Send a tab 'auth' response.
 */
export class SendTabAuthResponse extends BaseAuthResponseDialog implements BaseAuthResponseDialogConfiguration {
    /**
     * Class identifier.
     */
    public static $kind = 'Teams.SendTabAuthResponse';

    /**
     * Builds the compute Id for the dialog.
     *
     * @returns {string} A string representing the compute Id.
     */
    protected onComputeId(): string {
        return `SendTabAuthResponse[\
            ${this.title?.toString() ?? ''}\
        ]`;
    }

    protected createOAuthInvokeResponseActivityFromCardAction(
        dc: DialogContext,
        cardAction: CardAction
    ): Partial<Activity> {
        const responsePayload: TabResponsePayload = {
            type: 'auth',
            suggestedActions: {
                actions: [cardAction],
            },
        };

        const tabResponse: TabResponse = { tab: responsePayload };

        return BaseTeamsCacheInfoResponseDialog.createInvokeResponseActivity(tabResponse);
    }
}
