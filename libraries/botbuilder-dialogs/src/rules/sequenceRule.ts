/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from '../dialog';
import { PlanningContext as PlanningContext, PlanChangeList } from './sequenceContext';
 
export interface PlanningRule {
    /**
     * Array of steps that should be registered with the `PlanningDialog` when the rule is added.
     */
    readonly steps: Dialog[];

    /**
     * Evaluates the rule and returns a predicted set of changes that should be applied to the 
     * current sequence.
     * @param sequence Context object for the current sequence.
     */
    evaluate(sequence: PlanningContext): Promise<PlanChangeList|undefined>;
}
