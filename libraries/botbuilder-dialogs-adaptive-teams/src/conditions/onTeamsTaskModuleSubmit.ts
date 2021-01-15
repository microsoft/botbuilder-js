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
 * Actions triggered when a Teams InvokeActivity is received with activity.name='task/submit'.
 */
export class OnTeamsTaskModuleSubmit extends OnInvokeActivity {
    public static $kind = 'Teams.OnTaskModuleSubmit';

    public getExpression(parser: ExpressionParserInterface): Expression {
        // if name is 'task/submit'
        return Expression.andExpression(
            Expression.parse(
                `${TurnPath.activity}.channelId == '${Channels.Msteams}' && ${TurnPath.activity}.name == 'task/submit'`
            ),
            super.getExpression(parser)
        );
    }
}
