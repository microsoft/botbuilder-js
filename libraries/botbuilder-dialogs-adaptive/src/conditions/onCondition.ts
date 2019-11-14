/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogEvent } from 'botbuilder-dialogs';
import { SequenceContext, ActionChangeList } from '../sequenceContext';
import { Expression, IExpressionParser } from 'botframework-expressions';

export interface OnCondition {
    /**
     * Array of actions that should be registered with the `PlanningDialog` when the rule is added.
     */
    readonly actions: Dialog[];

    /**
     * Evaluates the rule and returns a predicted set of changes that should be applied to the
     * current plan.
     * @param planning Planning context object for the current conversation.
     * @param event The current event being evaluated.
     * @param preBubble If `true`, the leading edge of the event is being evaluated.
     */
    evaluate(planning: SequenceContext, event: DialogEvent, preBubble: boolean): Promise<ActionChangeList[]|undefined>;

    getExpression(parser: IExpressionParser): Expression;
}
