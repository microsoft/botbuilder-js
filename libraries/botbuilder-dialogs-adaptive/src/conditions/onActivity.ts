/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { Expression, ExpressionType, ExpressionParserInterface } from 'adaptive-expressions';
import { AdaptiveEventNames } from '../sequenceContext';
import { OnDialogEvent } from './onDialogEvent';

/**
 * Actions triggered when a Activity of a given type is received.
 */
export class OnActivity extends OnDialogEvent {
    /**
     * Gets or sets the ActivityType which must be matched for this to trigger.
     */
    public type: string;

    public constructor(type?: string, actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEventNames.activityReceived, actions, condition);
        this.type = type;
    }

    public getExpression(parser: ExpressionParserInterface): Expression {
        // add constraints for activity type
        const expression = parser.parse(`${ TurnPath.activity }.type == '${ this.type }'`)
        return Expression.makeExpression(ExpressionType.And, undefined, expression, super.getExpression(parser));
    }
}