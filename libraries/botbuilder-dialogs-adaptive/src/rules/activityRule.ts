/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { EventRule } from './eventRule';
import { RuleDialogEventNames, PlanningContext, PlanChangeType } from '../planningContext';
import { DialogEvent, Dialog } from 'botbuilder-dialogs';

/**
 * This rule is triggered when an activity matching a list of types is received.
 */
export class ActivityRule extends EventRule {

    /**
     * List of activity types to filter to.
     */
    public readonly types: string[];

    /**
     * Creates a new `ActivityRule` instance.
     * @param types (Optional) list of activity types to filter to.
     * @param steps (Optional) list of steps to update the plan with when triggered.
     * @param changeType (Optional) type of plan modification to make when triggered. Defaults to `PlanChangeType.doSteps`.
     */
    constructor(types?: string|string[], steps?: Dialog[], changeType?: PlanChangeType) {
        super(RuleDialogEventNames.activityReceived, steps, changeType);
        this.types = Array.isArray(types) ? types : (types !== undefined ? [types] : []);
    }

    protected async onIsTriggered(planning: PlanningContext, event: DialogEvent, memory: object): Promise<boolean> {
        // Filter to supported activities.
        const activity = planning.context.activity;
        for (let i = 0; i < this.types.length; i++) {
            if (activity.type === this.types[i]) {
                return true;
            }
        }

        return false;
    }
}