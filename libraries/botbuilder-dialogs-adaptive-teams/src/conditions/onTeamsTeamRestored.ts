/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression, ExpressionParserInterface } from 'adaptive-expressions';
import { Channels } from 'botbuilder';
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { OnConversationUpdateActivity } from 'botbuilder-dialogs-adaptive';

/**
 * Actions triggered when a Teams ConversationUpdate with channelData.eventType == 'teamRestored'.
 * Note: turn.activity.channelData.Teams has team data.
 */
export class OnTeamsTeamRestored extends OnConversationUpdateActivity {
    public static $kind = 'Teams.OnTeamRestored';

    public constructor(actions?: Dialog[], condition?: string) {
        super(actions, condition);
    }

    public getExpression(parser: ExpressionParserInterface): Expression {
        // if teams channel and eventType == 'teamRestored'
        return Expression.andExpression(
            Expression.parse(
                `${TurnPath.activity}.channelId == '${Channels.Msteams}' && ${TurnPath.activity}.channelData.eventType == 'teamRestored'`
            ),
            super.getExpression(parser)
        );
    }
}
