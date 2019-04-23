/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogEvent } from 'botbuilder-dialogs';
import { SequenceContext, StepChangeList } from '../sequenceContext';
 
export interface Rule {
    /**
     * Array of steps that should be registered with the `PlanningDialog` when the rule is added.
     */
    readonly steps: Dialog[];

    /**
     * Evaluates the rule and returns a predicted set of changes that should be applied to the 
     * current plan.
     * @param planning Planning context object for the current conversation.
     * @param event The current event being evaluated.
     * @param memory Memory projection for the current turn.
     */
    evaluate(planning: SequenceContext, event: DialogEvent, memory: object): Promise<StepChangeList[]|undefined>;
}
