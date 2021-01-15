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
import { OnInvokeActivity } from 'botbuilder-dialogs-adaptive';

/**
 * Actions triggered when a Teams InvokeActivity is received with activity.name='composeExtension/query'.
 */
export class OnTeamsMessagingExtensionQuery extends OnInvokeActivity {
    public static $kind = 'Teams.OnMessagingExtensionQuery';

    public getExpression(parser: ExpressionParserInterface): Expression {
        // if name is 'composeExtension/query'
        return Expression.andExpression(
            Expression.parse(
                `${TurnPath.activity}.channelId == '${Channels.Msteams}' && ${TurnPath.activity}.name == 'composeExtension/query'`
            ),
            super.getExpression(parser)
        );
    }
}
