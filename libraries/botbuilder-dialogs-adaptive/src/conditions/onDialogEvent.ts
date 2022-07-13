/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Expression } from 'adaptive-expressions';
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { OnCondition, OnConditionConfiguration } from './onCondition';

export interface OnDialogEventConfiguration extends OnConditionConfiguration {
    event?: string;
}

/**
 * Actions triggered when a dialog event is emitted.
 */
export class OnDialogEvent extends OnCondition implements OnDialogEventConfiguration {
    static $kind = 'Microsoft.OnDialogEvent';

    /**
     * Gets or sets the event to fire on.
     */
    event: string;

    /**
     * Creates a new `OnDialogEvent` instance.
     *
     * @param event (Optional) The event to fire on.
     * @param actions (Optional) The actions to add to the plan when the rule constraints are met.
     * @param condition (Optional) The condition which needs to be met for the actions to be executed.
     */
    constructor(event?: string, actions: Dialog[] = [], condition?: string) {
        super(condition, actions);
        this.event = event;
    }

    /**
     * Create the expression for this condition.
     *
     * @returns [Expression](xref:adaptive-expressions.Expression) used to evaluate this rule.
     */
    protected createExpression(): Expression {
        return Expression.andExpression(
            Expression.parse(`${TurnPath.dialogEvent}.name == '${this.event}'`),
            super.createExpression()
        );
    }
}
