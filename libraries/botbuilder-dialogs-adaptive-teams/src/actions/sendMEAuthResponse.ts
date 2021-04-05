/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, CardAction, MessagingExtensionResult } from 'botbuilder';
import { DialogContext } from 'botbuilder-dialogs';
import { BaseAuthResponseDialog, BaseAuthResponseDialogConfiguration } from './baseAuthResponseDialog';

/**
 * Send a messaging extension 'result' response when a Teams Invoke Activity is received with activity.name='composeExtension/queryLink'.
 */
export class SendMEAuthResponse extends BaseAuthResponseDialog implements BaseAuthResponseDialogConfiguration {
    /**
     * Class identifier.
     */
    static $kind = 'Teams.SendMEAuthResponse';

    /**
     * Builds the compute Id for the dialog.
     *
     * @returns {string} A string representing the compute Id.
     */
    protected onComputeId(): string {
        return `SendMessagingExtensionAuthResponse[\
            ${this.title?.toString() ?? ''}\
        ]`;
    }

    protected createOAuthInvokeResponseActivityFromCardAction(
        dc: DialogContext,
        cardAction: CardAction
    ): Partial<Activity> {
        const result: MessagingExtensionResult = {
            type: 'auth',
            suggestedActions: {
                actions: [cardAction],
            },
        };

        return this.createMessagingExtensionInvokeResponseActivity(dc, result);
    }
}
