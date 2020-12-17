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
import { OnConversationUpdateActivity } from 'botbuilder-dialogs-adaptive';

/**
 * Actions triggered when a Teams ConversationUpdateActivity with channelData.eventType == 'channelRenamed'.
 * Note: turn.activity.channelData.Teams has team data.
 * @extends OnConversationUpdateActivity
 */
export class OnTeamsChannelRenamed extends OnConversationUpdateActivity {
    public static $kind = 'Teams.OnChannelRenamed';

    public constructor(actions?: Dialog[], condition?: string) {
        super(actions, condition);
    }

    protected createExpression(): Expression {
        // if teams channel and eventType == 'channelRenamed'
        return Expression.andExpression(
            Expression.parse(
                `${TurnPath.activity}.channelId == '${Channels.Msteams}' && ${TurnPath.activity}.channelData.eventType == 'channelRenamed'`
            ),
            super.createExpression()
        );
    }
}
