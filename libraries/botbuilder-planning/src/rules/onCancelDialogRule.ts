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
 * This rule is triggered when a child dialog has been cancelled.
 * 
 * @remarks
 * This rule lets a sequence or planning dialog intercept the cancellation as it propagates down
 * the call stack.
 */
export class OnCancelDialogRule extends EventRule {

    /**
     * Creates a new `OnCancelDialogRule` instance.
     * @param steps (Optional) list of steps to update the plan with when triggered.
     * @param changeType (Optional) type of plan modification to make when triggered. Defaults to `PlanChangeType.doSteps`.
     */
    constructor(steps?: Dialog[], changeType?: PlanChangeType) {
        super(PlanningEventNames.cancelDialog, steps, changeType);
    }
}
