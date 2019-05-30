/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { SequenceContext, StepChangeList, StepChangeType } from '../sequenceContext';
import { ExpressionPropertyValue, ExpressionProperty } from '../expressionProperty';

/**
 * Configuration info passed to a `ForEach` step.
 */
export interface ForEachConfiguration extends DialogConfiguration {
    /**
     * Expression used to compute the list that should be enumerated.
     */
    list?: ExpressionPropertyValue<any[]|object>;

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
     * @param list Expression used to compute the list that should be enumerated.
     * @param steps Steps to be run for each page of items. 
     */
    constructor();
    constructor(list: ExpressionPropertyValue<any[]|object>, steps: Dialog[]);
    constructor(list?: ExpressionPropertyValue<any[]|object>, steps?: Dialog[]) {
        super();
        if (list) { this.list = new ExpressionProperty(list) }
        if (steps) { this.steps = steps } 
    }

    protected onComputeID(): string {
        const label = this.list ? this.list.toString() : '';
        return `forEach[${this.hashedLabel(label)}]`;
    }

    /**
     * Expression used to compute the list that should be enumerated.
     */
    public list: ExpressionProperty<any[]|object>;

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
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch(key) {
                    case 'list':
                        this.list = new ExpressionProperty(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    public getDependencies(): Dialog[] {
        return this.steps;
    }

    protected async onRunCommand(sequence: SequenceContext, options: ForEachOptions): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(sequence instanceof SequenceContext)) { throw new Error(`${this.id}: should only be used within an AdaptiveDialog.`) }
        if (!this.list) { throw new Error(`${this.id}: no list expression specified.`) }

        // Unpack options
        let { list, offset } = options;
        if (list == undefined) { list = this.list.evaluate(this.id, sequence.state.toJSON()) }
        if (offset == undefined) { offset = 0 }

        // Get next page of items
        const item = this.getItem(list, offset);

        // Update current plan
        if (item !== undefined) {
            sequence.state.setValue(this.valueProperty, item);
            sequence.state.setValue(this.indexProperty, offset);
            const changes: StepChangeList = {
                changeType: StepChangeType.insertSteps,
                steps: []
            };
            this.steps.forEach((step) => changes.steps.push({ dialogStack: [], dialogId: step.id }));

            // Add a call back into forEachPage() at the end of repeated steps.
            // - A new offset is passed in which causes the next page of results to be returned.
            changes.steps.push({ 
                dialogStack: [], 
                dialogId: this.id, 
                options: { 
                    list: list,
                    offset: offset + 1
                }
            });
            sequence.queueChanges(changes);
        }

        return await sequence.endDialog();
    }

    private getItem(list: any[]|object, index: number): any {
        if (Array.isArray(list)) {
            if (index < list.length) {
                return list[index];
            }
        } else if (typeof list === 'object') {
            let i = 0;
            for (const key in list) {
                if (list.hasOwnProperty(key)) {
                    if (i == index) {
                        return list[key];
                    }
                    i++;
                }
            }
        }
        return undefined;
    }
}

interface ForEachOptions {
    list?: any[]|object;
    offset?: number;
}