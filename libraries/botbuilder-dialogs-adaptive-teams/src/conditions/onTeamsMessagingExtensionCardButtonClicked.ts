/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from 'adaptive-expressions';
import { Channels } from 'botbuilder';
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { OnInvokeActivity } from 'botbuilder-dialogs-adaptive';

export class OnTeamsMessagingExtensionCardButtonClicked extends OnInvokeActivity {
    public static $kind = 'Teams.OnMessagingExtensionCardButtonClicked';

    public constructor(actions?: Dialog[], condition?: string) {
        super(actions, condition);
    }

    protected createExpression(): Expression {
        // if name is 'composeExtension/onCardButtonClicked'
        return Expression.andExpression(
            Expression.parse(
                `${TurnPath.activity}.channelId == '${Channels.Msteams}' && ${TurnPath.activity}.name == 'composeExtension/onCardButtonClicked'`
            ),
            super.createExpression()
        );
    }
}
