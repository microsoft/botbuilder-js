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
import { OnInvokeActivity } from 'botbuilder-dialogs-adaptive';

/**
 * Actions triggered when a Teams InvokeActivity is received with activity.name='composeExtension/submitAction'
 * and activity.value.botMessagePreviewAction == 'edit'.
 */
export class OnTeamsMessagingExtensionBotMessagePreviewEdit extends OnInvokeActivity {
    public static $kind = 'Teams.OnMessagingExtensionBotMessagePreviewEdit';

    public constructor(actions?: Dialog[], condition?: string) {
        super(actions, condition);
    }

    public getExpression(parser: ExpressionParserInterface): Expression {
        // if name is 'composeExtension/submitAction'
        return Expression.andExpression(
            Expression.parse(
                `${TurnPath.activity}.channelId == '${Channels.Msteams}' && ${TurnPath.activity}.name == 'composeExtension/submitAction' && ` +
                    `${TurnPath.activity}.value.botMessagePreviewAction == 'edit'`
            ),
            super.getExpression(parser)
        );
    }
}
