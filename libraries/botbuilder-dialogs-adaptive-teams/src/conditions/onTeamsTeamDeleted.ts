/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression, ExpressionParserInterface } from 'adaptive-expressions';
import { Channels } from 'botbuilder';
import { TurnPath } from 'botbuilder-dialogs';
import { OnConversationUpdateActivity } from 'botbuilder-dialogs-adaptive';

/**
 * Actions triggered when a Teams ConversationUpdate with channelData.eventType == 'teamDeleted'.
 * Note: turn.activity.channelData.Teams has team data.
 */
export class OnTeamsTeamDeleted extends OnConversationUpdateActivity {
    public static $kind = 'Teams.OnTeamDeleted';

    public getExpression(parser: ExpressionParserInterface): Expression {
        // if teams channel and eventType == 'teamDeleted'
        return Expression.andExpression(
            Expression.parse(
                `${TurnPath.activity}.channelId == '${Channels.Msteams}' && ${TurnPath.activity}.channelData.eventType == 'teamDeleted'`
            ),
            super.getExpression(parser)
        );
    }
}
