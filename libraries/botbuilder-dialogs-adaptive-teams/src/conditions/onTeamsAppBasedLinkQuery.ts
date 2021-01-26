/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression, ExpressionParserInterface } from 'adaptive-expressions';
import { TurnPath } from 'botbuilder-dialogs';
import { OnInvokeActivity } from 'botbuilder-dialogs-adaptive';

/**
 * Actions triggered when a Teams InvokeActivity is received with activity.name == 'composeExtension/queryLink'.
 */
export class OnTeamsAppBasedLinkQuery extends OnInvokeActivity {
    public static $kind = 'Teams.OnAppBasedLinkQuery';

    public getExpression(parser: ExpressionParserInterface): Expression {
        return Expression.andExpression(
            Expression.parse(`${TurnPath.activity}.name == 'composeExtension/queryLink'`),
            super.getExpression(parser)
        );
    }
}
