/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Expression } from 'adaptive-expressions';
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { OnEventActivity } from './onEventActivity';

/**
 * Actions triggered when an EventActivity is received.
 */
export class OnContinueConversation extends OnEventActivity {
    static $kind = 'Microsoft.OnContinueConversation';

    /**
     * Initializes a new instance of the [OnContinueConversation](xref:botbuilder-dialogs-adaptive.OnContinueConversation) class.
     *
     * @param {Dialog[]} actions Optional, actions to add to the plan when the rule constraints are met.
     * @param {string} condition Optional, ondition which needs to be met for the actions to be executed.
     */
    constructor(actions: Dialog[] = [], condition?: string) {
        super(actions, condition);
    }

    /**
     * Create expression for this condition.
     *
     * @returns {Expression} An [Expression](xref:adaptive-expressions.Expression) used to evaluate this rule.
     */
    protected createExpression(): Expression {
        // add constraints for activity type
        return Expression.andExpression(
            Expression.parse(`${TurnPath.activity}.name == 'ContinueConversation'`),
            super.createExpression()
        );
    }
}
