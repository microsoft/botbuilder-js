/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogEvent } from 'botbuilder-dialogs';
import { PlanningContext, PlanChangeList } from '../planningContext';
 
export interface PlanningRule {
    /**
     * Array of steps that should be registered with the `PlanningDialog` when the rule is added.
     */
    readonly steps: Dialog[];

    /**
     * Evaluates the rule and returns a predicted set of changes that should be applied to the 
     * current plan.
     * @param planning Planning context object for the current conversation.
     * @param event The current event being evaluated.
     */
    evaluate(planning: PlanningContext, event: DialogEvent): Promise<PlanChangeList[]|undefined>;
}
