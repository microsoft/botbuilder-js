/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from 'adaptive-expressions';
import { TurnPath } from 'botbuilder-dialogs';
import { OnInvokeActivity } from 'botbuilder-dialogs-adaptive';

/**
 * Actions triggered when a Teams InvokeActivity is received with activity.name == 'composeExtension/queryLink'.
 */
export class OnTeamsAppBasedLinkQuery extends OnInvokeActivity {
    static $kind = 'Teams.OnAppBasedLinkQuery';

    /**
     * Create expression for this condition.
     *
     * @returns {Expression} An [Expression](xref:adaptive-expressions.Expression) used to evaluate this rule.
     */
    protected createExpression(): Expression {
        return Expression.andExpression(
            Expression.parse(`${TurnPath.activity}.name == 'composeExtension/queryLink'`),
            super.createExpression()
        );
    }
}
