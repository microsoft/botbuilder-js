/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { SequenceContext, StepChangeType, StepChangeList } from '../sequenceContext';

/**
 * Configuration info passed to a `ForEachPage` step.
 */
export interface ForEachPageConfiguration extends DialogConfiguration {
    /**
     * In-memory property containing list or collection to be enumerated.
     */
    sourceProperty?: string;

    /**
     * In-memory property that will contain the current items value. Defaults to `dialog.value`.
     */
    valueProperty?: string;

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
    constructor(sourceProperty: string, steps: Dialog[]);
    constructor(sourceProperty: string, pageSize: number, steps: Dialog[]);
    constructor(sourceProperty?: string, pageSizeOrSteps?: number|Dialog[], steps?: Dialog[]) {
        super();
        if (Array.isArray(pageSizeOrSteps)) {
            steps = pageSizeOrSteps;
            pageSizeOrSteps = undefined;
        }
        if (sourceProperty) { this.sourceProperty = sourceProperty }
        if (pageSizeOrSteps) { this.pageSize = pageSizeOrSteps as number }
        if (steps) { this.steps = steps } 
    }

    protected onComputeID(): string {
        return `forEachPage[${this.bindingPath}]`;
    }

    /**
     * In-memory property containing list or collection to be enumerated.
     */
    public sourceProperty: string;

    /**
     * In-memory property that will contain the current items value. Defaults to `dialog.value`.
     */
    public valueProperty: string = 'dialog.value';

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

    protected async onRunCommand(sequence: SequenceContext, options: ForEachPageOptions): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(sequence instanceof SequenceContext)) { throw new Error(`ForEachPage: should only be used within an AdaptiveDialog.`) }

        // Get next page of items
        const offset = options && typeof options.offset == 'number' ? options.offset : 0;
        const page = this.getPage(sequence, offset);

        // Update current plan
        if (page.length > 0) {
            sequence.state.setValue(this.valueProperty, page);
            const changes: StepChangeList = {
                changeType: StepChangeType.InsertSteps,
                steps: []
            };
            this.steps.forEach((step) => changes.steps.push({ dialogStack: [], dialogId: step.id }));
            if (page.length == this.pageSize) {
                // Add a call back into forEachPage() at the end of repeated steps.
                // - A new offset is passed in which causes the next page of results to be returned.
                changes.steps.push({ dialogStack: [], dialogId: this.id, options: { offset: offset + this.pageSize }});
            }
            sequence.queueChanges(changes);
        }

        return await sequence.endDialog();
    }

    private getPage(sequence: SequenceContext, offset: number): any[] {
        const page: any[] = [];
        const end = offset + this.pageSize;
        const value = sequence.state.getValue(this.sourceProperty);
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