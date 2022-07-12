/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Expression } from 'adaptive-expressions';
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { OnDialogEvent, OnDialogEventConfiguration } from './onDialogEvent';
import { AdaptiveEvents } from '../adaptiveEvents';

export interface OnActivityConfiguration extends OnDialogEventConfiguration {
    type?: string;
}

/**
 * Actions triggered when an [Activity](xref:botframework-schema.Activity) of a given type is received.
 */
export class OnActivity extends OnDialogEvent implements OnActivityConfiguration {
    static $kind = 'Microsoft.OnActivity';

    /**
     * Gets or sets the ActivityType which must be matched for this to trigger.
     */
    type: string;

    /**
     * Initializes a new instance of the [OnActivity](xref:botbuilder-dialogs-adaptive.OnActivity) class.
     *
     * @param type Optional, ActivityType which must be matched for this event to trigger.
     * @param actions Optional, actions to add to the plan when the rule constraints are met.
     * @param condition Optional, condition which needs to be met for the actions to be executed.
     */
    constructor(type?: string, actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.activityReceived, actions, condition);
        this.type = type;
    }

    /**
     * Create expression for this condition.
     *
     * @returns {Expression} An [Expression](xref:adaptive-expressions.Expression) used to evaluate this rule.
     */
    protected createExpression(): Expression {
        // add constraints for activity type
        return Expression.andExpression(
            Expression.parse(`${TurnPath.activity}.type == '${this.type}'`),
            super.createExpression()
        );
    }
}
