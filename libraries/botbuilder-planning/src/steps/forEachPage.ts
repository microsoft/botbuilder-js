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
 * Configuration info passed to a `ForEachPage` step.
 */
export interface ForEachPageConfiguration extends DialogConfiguration {
    /**
     * In-memory property containing list or collection to be enumerated.
     */
    property?: string;

    /**
     * (Optional) number of items per page. Defaults to a value of 10.
     */
    pageSize?: number;

    /**
     * Steps to be run for each page of items.
     */
    steps?: Dialog[];
}

/**
 * Executes a set of steps once for each page of results in an in-memory list or collection.
 * 
 * @remarks
 * The list or collection at [property](#property) will be broken up into pages and stored in
 * `dialog.page` for each iteration of the loop. The size of each page is determined by [maxSize](#maxsize)
 * and defaults to a size of 10. The loop can be exited early by including either a `EndDialog` or
 * `GotoDialog` step.
 */
export class ForEachPage extends DialogCommand {

    /**
     * Creates a new `ForEachPage` instance.
     * @param property In-memory property containing list or collection to be enumerated.
     * @param pageSize (Optional) number of items per page. Defaults to a value of 10.
     * @param steps Steps to be run for each page of items. 
     */
    constructor();
    constructor(property: string, steps: Dialog[]);
    constructor(property: string, pageSize: number, steps: Dialog[]);
    constructor(property?: string, pageSizeOrSteps?: number|Dialog[], steps?: Dialog[]) {
        super();
        if (Array.isArray(pageSizeOrSteps)) {
            steps = pageSizeOrSteps;
            pageSizeOrSteps = undefined;
        }
        if (property) { this.property = property }
        if (pageSizeOrSteps) { this.pageSize = pageSizeOrSteps as number }
        if (steps) { this.steps = steps } 
    }

    protected onComputeID(): string {
        return `forEachPage[${this.bindingPath}]`;
    }

    /**
     * In-memory property containing list or collection to be enumerated.
     */
    public property: string;

    /**
     * Number of items per page. Defaults to a value of 10.
     */
    public pageSize: number = 10;

    /**
     * Steps to be run for each page of items.
     */
    public steps: Dialog[] = [];

    public configure(config: ForEachPageConfiguration): this {
        return super.configure(config);
    }

    public getDependencies(): Dialog[] {
        return this.steps;
    }

    protected async onRunCommand(planning: PlanningContext, options: ForEachPageOptions): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(planning instanceof PlanningContext)) { throw new Error(`ForEachPage: should only be used within a planning or sequence dialog.`) }

        // Get next page of items
        const offset = options && typeof options.offset == 'number' ? options.offset : 0;
        const page = this.getPage(planning, offset);

        // Update current plan
        if (page.length > 0) {
            planning.state.setValue('dialog.page', page);
            const changes: PlanChangeList = {
                changeType: PlanChangeType.doSteps,
                steps: []
            };
            this.steps.forEach((step) => changes.steps.push({ dialogStack: [], dialogId: step.id }));
            if (page.length == this.pageSize) {
                // Add a call back into forEachPage() at the end of repeated steps.
                // - A new offset is passed in which causes the next page of results to be returned.
                changes.steps.push({ dialogStack: [], dialogId: this.id, options: { offset: offset + this.pageSize }});
            }
            planning.queueChanges(changes);
        }

        return await planning.endDialog();
    }

    private getPage(planning: PlanningContext, offset: number): any[] {
        const page: any[] = [];
        const end = offset + this.pageSize;
        const value = planning.state.getValue(this.property);
        if (Array.isArray(value)) {
            for (let i = offset; i >= offset && i < end; i++) {
                page.push(value[i]);
            }
        } else if (typeof value === 'object') {
            let i = 0;
            for (const key in value) {
                if (value.hasOwnProperty(key)) {
                    if (i >= offset && i < end) {
                        page.push(value[key]);
                    }
                    i++;
                }
            }
        }
        return page;
    }
}

interface ForEachPageOptions {
    offset?: number;
}
