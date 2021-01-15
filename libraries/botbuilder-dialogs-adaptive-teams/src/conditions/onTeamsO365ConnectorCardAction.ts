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
 * Actions triggered when a Teams InvokeActivity is received for 'actionableMessage/executeAction'.
 */
export class OnTeamsO365ConnectorCardAction extends OnInvokeActivity {
    public static $kind = 'Teams.OnO365ConnectorCardAction';

    public getExpression(parser: ExpressionParserInterface): Expression {
        // if name is 'actionableMessage/executeAction'
        return Expression.andExpression(
            Expression.parse(
                `${TurnPath.activity}.channelId == '${Channels.Msteams}' && ${TurnPath.activity}.name == 'actionableMessage/executeAction'`
            ),
            super.getExpression(parser)
        );
    }
}
