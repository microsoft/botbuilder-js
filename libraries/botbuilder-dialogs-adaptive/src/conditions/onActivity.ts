/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { Expression, ExpressionType, ExpressionParserInterface } from 'adaptive-expressions';
import { OnDialogEvent, OnDialogEventConfiguration } from './onDialogEvent';
import { AdaptiveEvents } from '../adaptiveEvents';

export interface OnActivityConfiguration extends OnDialogEventConfiguration {
    type?: string;
}

/**
 * Actions triggered when an [Activity](xref:botframework-schema.Activity) of a given type is received.
 */
export class OnActivity extends OnDialogEvent implements OnActivityConfiguration {
    public static $kind = 'Microsoft.OnActivity';

    /**
     * Gets or sets the ActivityType which must be matched for this to trigger.
     */
    public type: string;

    /**
     * Initializes a new instance of the [OnActivity](xref:botbuilder-dialogs-adaptive.OnActivity) class.
     * @param type Optional. ActivityType which must be matched for this event to trigger.
     * @param actions Optional. A [Dialog](xref:botbuilder-dialogs.Dialog) list containing the actions to add to the plan when the rule constraints are met.
     * @param condition Optional. Condition which needs to be met for the actions to be executed.
     */
    public constructor(type?: string, actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.activityReceived, actions, condition);
        this.type = type;
    }

    /**
     * Gets this activity representing expression.
     * @param parser [ExpressionParserInterface](xref:adaptive-expressions.ExpressionParserInterface) used to parse a string into an [Expression](xref:adaptive-expressions.Expression).
     * @returns An [Expression](xref:adaptive-expressions.Expression) representing the [Activity](xref:botframework-schema.Activity).
     */
    public getExpression(parser: ExpressionParserInterface): Expression {
        // add constraints for activity type
        const expression = parser.parse(`${TurnPath.activity}.type == '${this.type}'`);
        return Expression.makeExpression(ExpressionType.And, undefined, expression, super.getExpression(parser));
    }
}
