/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { EventRule } from './eventRule';
import { PlanningEventNames, PlanningContext } from './planningContext';

export class ActivityRule extends EventRule {

    public readonly types: string[];

    constructor(types?: string|string[]) {
        super(PlanningEventNames.activityReceived);
        this.types = Array.isArray(types) ? types : (types !== undefined ? [types] : []);
    }

    protected async onIsTriggered(planning: PlanningContext): Promise<boolean> {
        // Filter to supported activities.
        const activity = planning.context.activity;
        for (let i = 0; i < this.types.length; i++) {
            if (activity.type === this.types[i]) {
                return await super.onIsTriggered(planning);
            }
        }

        return undefined;
    }
}