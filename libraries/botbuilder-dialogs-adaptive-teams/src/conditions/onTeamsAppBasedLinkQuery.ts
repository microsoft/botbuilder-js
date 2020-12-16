/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from 'adaptive-expressions';
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { OnInvokeActivity } from 'botbuilder-dialogs-adaptive';

export class OnTeamsAppBasedLinkQuery extends OnInvokeActivity {
    public static $kind = 'Teams.OnAppBasedLinkQuery';

    public constructor(actions?: Dialog[], condition?: string) {
        super(actions, condition);
    }

    protected createExpression(): Expression {
        // if name is 'composeExtension/queryLink'
        return Expression.andExpression(
            Expression.parse(`${TurnPath.activity}.name == 'composeExtension/queryLink'`),
            super.createExpression()
        );
    }
}
