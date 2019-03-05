/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { PlanningContext, PlanChangeType, PlanChangeList } from '../planningContext';

/**
 * Configuration info passed to a `ForEach` step.
 */
export interface ForEachConfiguration extends DialogConfiguration {
    /**
     * In-memory property containing list or collection to be enumerated.
     */
    property?: string;

    /**
     * Steps to be run for each page of items.
     */
    steps?: Dialog[];
}

/**
 * Executes a set of steps once for each item in an in-memory list or collection.
 * 
 * @remarks
 * Each iteration of the loop will store an item from the list or collection at [property](#property) 
 * to `dialog.item`. The loop can be exited early by including either a `EndDialog` or `GotoDialog` 
 * step.
 */
export class ForEach extends DialogCommand {

    /**
     * Creates a new `ForEach` instance.
     * @param property In-memory property containing list or collection to be enumerated.
     * @param steps Steps to be run for each page of items. 
     */
    constructor();
    constructor(property: string, steps: Dialog[]);
    constructor(property?: string, steps?: Dialog[]) {
        super();
        if (property) { this.property = property }
        if (steps) { this.steps = steps } 
    }

    protected onComputeID(): string {
        return `forEach[${this.bindingPath}]`;
    }

    /**
     * In-memory property containing list or collection to be enumerated.
     */
    public property: string;

    /**
     * Steps to be run for each page of items.
     */
    public steps: Dialog[] = [];

    public configure(config: ForEachConfiguration): this {
        return super.configure(config);
    }

    public getDependencies(): Dialog[] {
        return this.steps;
    }

    protected async onRunCommand(planning: PlanningContext, options: ForEachOptions): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(planning instanceof PlanningContext)) { throw new Error(`ForEach: should only be used within a planning or sequence dialog.`) }

        // Get next page of items
        const nextItem = options && typeof options.nextItem == 'number' ? options.nextItem : 0;
        const item = this.getItem(planning, nextItem);

        // Update current plan
        if (item !== undefined) {
            planning.state.setValue('dialog.item', item);
            planning.state.setValue('dialog.index', nextItem);
            const changes: PlanChangeList = {
                changeType: PlanChangeType.doSteps,
                steps: []
            };
            this.steps.forEach((step) => changes.steps.push({ dialogStack: [], dialogId: step.id }));

            // Add a call back into forEachPage() at the end of repeated steps.
            // - A new offset is passed in which causes the next page of results to be returned.
            changes.steps.push({ dialogStack: [], dialogId: this.id, options: { nextItem: nextItem + 1 }});
            planning.queueChanges(changes);
        }

        return await planning.endDialog();
    }

    private getItem(planning: PlanningContext, index: number): any {
        const value = planning.state.getValue(this.property);
        if (Array.isArray(value)) {
            if (index < value.length) {
                return value[index];
            }
        } else if (typeof value === 'object') {
            let i = 0;
            for (const key in value) {
                if (value.hasOwnProperty(key)) {
                    if (i == index) {
                        return value[key];
                    }
                    i++;
                }
            }
        }
        return undefined;
    }
}

interface ForEachOptions {
    nextItem?: number;
}
