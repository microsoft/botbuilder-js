/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { SequenceContext, ActionChangeType, ActionChangeList } from '../sequenceContext';
import { ExpressionPropertyValue, ExpressionProperty } from '../expressionProperty';

/**
 * Configuration info passed to a `ForEachPage` action.
 */
export interface ForEachPageConfiguration extends DialogConfiguration {
    /**
     * Expression used to compute the list that should be enumerated.
     */
    list?: ExpressionPropertyValue<any[]|object>;

    /**
     * (Optional) expression to compute number of items per page. Defaults to "10".
     */
    pageSize?: ExpressionPropertyValue<number>;

    /**
     * In-memory property that will contain the current items value. Defaults to `dialog.value`.
     */
    valueProperty?: string;

    /**
     * Actions to be run for each page of items.
     */
    actions?: Dialog[];
}

/**
 * Executes a set of actions once for each page of results in an in-memory list or collection.
 *
 * @remarks
 * The list or collection at [property](#property) will be broken up into pages and stored in
 * `dialog.page` for each iteration of the loop. The size of each page is determined by [maxSize](#maxsize)
 * and defaults to a size of 10. The loop can be exited early by including either a `EndDialog` or
 * `GotoDialog` action.
 */
export class ForEachPage extends Dialog {

    /**
     * Creates a new `ForEachPage` instance.
     * @param list Expression used to compute the list that should be enumerated.
     * @param pageSize (Optional) number of items per page. Defaults to a value of 10.
     * @param actions Actions to be run for each page of items.
     */
    constructor();
    constructor(list: ExpressionPropertyValue<any[]|object>, actions: Dialog[]);
    constructor(list: ExpressionPropertyValue<any[]|object>, pageSize: ExpressionPropertyValue<number>, actions: Dialog[]);
    constructor(list?: ExpressionPropertyValue<any[]|object>, pageSizeOrActions?: ExpressionPropertyValue<number>|Dialog[], actions?: Dialog[]) {
        super();
        if (Array.isArray(pageSizeOrActions)) {
            actions = pageSizeOrActions;
            pageSizeOrActions = undefined;
        }
        if (list) { this.list = new ExpressionProperty(list) }
        if (pageSizeOrActions) { this.pageSize = new ExpressionProperty(pageSizeOrActions as any) }
        if (actions) { this.actions = actions }
    }

    protected onComputeId(): string {
        const label = this.list ? this.list.toString() : '';
        return `ForEachPage[${label}]`;
    }

    /**
     * Expression used to compute the list that should be enumerated.
     */
    public list: ExpressionProperty<any[]|object>;

    /**
     * Number of items per page. Defaults to a value of 10.
     */
    public pageSize: ExpressionProperty<number> = new ExpressionProperty("10");

    /**
     * In-memory property that will contain the current items value. Defaults to `dialog.value`.
     */
    public valueProperty: string = 'dialog.value';

    /**
     * Actions to be run for each page of items.
     */
    public actions: Dialog[] = [];

    public configure(config: ForEachPageConfiguration): this {
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
        return this.actions;
    }

    public async beginDialog(sequence: SequenceContext, options: ForEachPageOptions): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(sequence instanceof SequenceContext)) { throw new Error(`${this.id}: should only be used within an AdaptiveDialog.`) }
        if (!this.list) { throw new Error(`${this.id}: no list expression specified.`) }
        if (!this.pageSize) { throw new Error(`${this.id}: no pageSize expression specified.`) }

        // Unpack options
        let { list, offset, pageSize } = options;
        const memory = sequence.state;
        if (list == undefined) { list = this.list.evaluate(this.id, memory) }
        if (pageSize == undefined) { pageSize = this.pageSize.evaluate(this.id, memory) }
        if (offset == undefined) { offset = 0 }

        // Get next page of items
        const page = this.getPage(list, offset, pageSize);

        // Update current plan
        if (page.length > 0) {
            sequence.state.setValue(this.valueProperty, page);
            const changes: ActionChangeList = {
                changeType: ActionChangeType.insertActions,
                actions: []
            };
            this.actions.forEach((action) => changes.actions.push({ dialogStack: [], dialogId: action.id }));
            if (page.length == pageSize) {
                // Add a call back into forEachPage() at the end of repeated actions.
                // - A new offset is passed in which causes the next page of results to be returned.
                changes.actions.push({
                    dialogStack: [],
                    dialogId: this.id,
                    options: {
                        list: list,
                        offset: offset + pageSize,
                        pageSize: pageSize
                    }
                });
            }
            sequence.queueChanges(changes);
        }

        return await sequence.endDialog();
    }

    private getPage(list: any[]|object, offset: number, pageSize: number): any[] {
        const page: any[] = [];
        const end = offset + pageSize;
        if (Array.isArray(list)) {
            for (let i = offset; i >= offset && i < end; i++) {
                page.push(list[i]);
            }
        } else if (typeof list === 'object') {
            let i = 0;
            for (const key in list) {
                if (list.hasOwnProperty(key)) {
                    if (i >= offset && i < end) {
                        page.push(list[key]);
                    }
                    i++;
                }
            }
        }
        return page;
    }
}

interface ForEachPageOptions {
    list: any[]|object;
    offset?: number;
    pageSize?: number;
}