/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { EventRule } from './eventRule';
import { PlanningEventNames, PlanChangeType } from '../planningContext';
import { Dialog } from 'botbuilder-dialogs';

/**
 * This rule is triggered when a message is received and isn't handled.
 * 
 * @remarks
 * A message is considered unhandled if there were no other rules triggered by the message and 
 * there is no active plan being executed.
 */
export class FallbackRule extends EventRule {

    /**
     * Creates a new `FallbackRule` instance.
     * @param steps (Optional) list of steps to update the plan with when triggered.
     * @param changeType (Optional) type of plan modification to make when triggered. Defaults to `PlanChangeType.doSteps`.
     */
    constructor(steps?: Dialog[], changeType?: PlanChangeType) {
        super(PlanningEventNames.fallback, steps, changeType);
    }
}
