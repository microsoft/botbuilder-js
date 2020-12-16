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

export class OnTeamsMessagingExtensionQuery extends OnInvokeActivity {
    public static $kind = 'Teams.OnMessagingExtensionQuery';

    public constructor(actions?: Dialog[], condition?: string) {
        super(actions, condition);
    }

    protected createExpression(): Expression {
        // if name is 'composeExtension/query'
        return Expression.andExpression(
            Expression.parse(
                `${TurnPath.activity}.channelId == '${Channels.Msteams}' && ${TurnPath.activity}.name == 'composeExtension/query'`
            ),
            super.createExpression()
        );
    }
}
