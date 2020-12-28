/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Expression, ExpressionParserInterface } from 'adaptive-expressions';
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { OnEventActivity } from './onEventActivity';

/**
 * Actions triggered when an EventActivity is received.
 */
export class OnContinueConversation extends OnEventActivity {
    public static $kind = 'Microsoft.OnContinueConversation';

    /**
     * Initializes a new instance of the [OnContinueConversation](xref:botbuilder-dialogs-adaptive.OnContinueConversation) class.
     *
     * @param {Dialog[]} actions Optional. A [Dialog](xref:botbuilder-dialogs.Dialog) list containing the actions to add to the plan when the rule constraints are met.
     * @param {string} condition Optional. Condition which needs to be met for the actions to be executed.
     */
    public constructor(actions: Dialog[] = [], condition?: string) {
        super(actions, condition);
    }

    /**
     * Gets this activity representing expression.
     *
     * @param {ExpressionParserInterface} parser [ExpressionParserInterface](xref:adaptive-expressions.ExpressionParserInterface) used to parse a string into an [Expression](xref:adaptive-expressions.Expression).
     * @returns {Expression} An [Expression](xref:adaptive-expressions.Expression) representing the [Activity](xref:botframework-schema.Activity).
     */
    public getExpression(parser: ExpressionParserInterface): Expression {
        // add constraints for activity type
        return Expression.andExpression(
            Expression.parse(`${TurnPath.activity}.name == 'ContinueConversation'`),
            super.getExpression(parser)
        );
    }
}
