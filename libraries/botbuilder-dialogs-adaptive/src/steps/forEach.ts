/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { SequenceContext, StepChangeList, StepChangeType } from '../sequenceContext';

/**
 * Configuration info passed to a `ForEach` step.
 */
export interface ForEachConfiguration extends DialogConfiguration {
    /**
     * In-memory property containing list or collection to be enumerated.
     */
    sourceProperty?: string;

    /**
     * In-memory property that will contain the current items index. Defaults to `dialog.index`.
     */
    indexProperty?: string;

    /**
     * In-memory property that will contain the current items value. Defaults to `dialog.value`.
     */
    valueProperty?: string;

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
    constructor(sourceProperty: string, steps: Dialog[]);
    constructor(sourceProperty?: string, steps?: Dialog[]) {
        super();
        if (sourceProperty) { this.sourceProperty = sourceProperty }
        if (steps) { this.steps = steps } 
    }

    protected onComputeID(): string {
        return `forEach[${this.bindingPath}]`;
    }

    /**
     * In-memory property containing list or collection to be enumerated.
     */
    public sourceProperty: string;

    /**
     * In-memory property that will contain the current items index. Defaults to `dialog.index`.
     */
    public indexProperty: string = 'dialog.index';

    /**
     * In-memory property that will contain the current items value. Defaults to `dialog.value`.
     */
    public valueProperty: string = 'dialog.value';

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

    protected async onRunCommand(sequence: SequenceContext, options: ForEachOptions): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(sequence instanceof SequenceContext)) { throw new Error(`ForEach: should only be used within an AdaptiveDialog.`) }

        // Get next page of items
        const nextItem = options && typeof options.nextItem == 'number' ? options.nextItem : 0;
        const item = this.getItem(sequence, nextItem);

        // Update current plan
        if (item !== undefined) {
            sequence.state.setValue(this.valueProperty, item);
            sequence.state.setValue(this.indexProperty, nextItem);
            const changes: StepChangeList = {
                changeType: StepChangeType.InsertSteps,
                steps: []
            };
            this.steps.forEach((step) => changes.steps.push({ dialogStack: [], dialogId: step.id }));

            // Add a call back into forEachPage() at the end of repeated steps.
            // - A new offset is passed in which causes the next page of results to be returned.
            changes.steps.push({ dialogStack: [], dialogId: this.id, options: { nextItem: nextItem + 1 }});
            sequence.queueChanges(changes);
        }

        return await sequence.endDialog();
    }

    private getItem(sequence: SequenceContext, index: number): any {
        const value = sequence.state.getValue(this.sourceProperty);
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