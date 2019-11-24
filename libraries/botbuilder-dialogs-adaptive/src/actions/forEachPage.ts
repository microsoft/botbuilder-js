/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogConfiguration, DialogContext } from 'botbuilder-dialogs';
import { ActionChangeType, ActionChangeList } from '../sequenceContext';
import { ExpressionPropertyValue, ExpressionProperty } from '../expressionProperty';
import { ActionScopeConfiguration, ActionScope } from './actionScope';

/**
 * @private
 */
const LIST_KEY: string = 'this.list';

/**
 * @private
 */
const SKIP_KEY: string = 'this.skip';

/**
 * @private
 */
const COUNT_KEY: string = 'this.count';

/**
 * @private
 */
const ITERATOR_KEY: string = 'this.iterator';

/**
 * Configuration info passed to a `ForEachPage` action.
 */
export interface ForEachPageConfiguration extends ActionScopeConfiguration {
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
export class ForEachPage<O extends object = {}> extends ActionScope<O> {

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
        super()
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

    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        // Evaluate list
        if (!this.list) { throw new Error(`${this.id}: no list expression specified.`) }
        const list = this.list.evaluate(this.id, dc.state);

        // Count list items
        let count: number = 0;
        if (Array.isArray(list)) {
            count = list.length;
        } else if (typeof list == 'object') {
            for (const key in list) {
                if (list.hasOwnProperty(key)) {
                    count++;
                }
            }
        }

        // Get page size
        if (!this.pageSize) { throw new Error(`${this.id}: no pageSize expression specified.`) }
        const skip = this.pageSize.evaluate(this.id, dc.state);
        if (typeof skip != 'number' || skip < 1) { throw new Error(`${this.id}: invalid pageSize of '${skip}'.`) }

        // Initialize persisted state
        dc.state.setValue(LIST_KEY, list);
        dc.state.setValue(SKIP_KEY, skip);
        dc.state.setValue(COUNT_KEY, count);
        dc.state.setValue(ITERATOR_KEY, -skip);
        dc.state.setValue(this.valueProperty, undefined);

        // Start loop for first page
        return await this.nextPage(dc);
    }

    protected async onBreak(dc: DialogContext): Promise<DialogTurnResult> {
        return await dc.endDialog();
    }

    protected async onContinue(dc: DialogContext): Promise<DialogTurnResult> {
        return await this.nextPage(dc);
    }

    protected async onEndOfActions(dc: DialogContext): Promise<DialogTurnResult> {
        return await this.nextPage(dc);
    }

    private async nextPage(dc: DialogContext): Promise<DialogTurnResult> {
        // Get list information
        const list: any[]|object = dc.state.getValue(LIST_KEY);
        const skip: number = dc.state.getValue(SKIP_KEY);
        const count: number = dc.state.getValue(COUNT_KEY);
        let iterator: number = dc.state.getValue(ITERATOR_KEY);

        // Next page
        iterator += skip;
        if (iterator < count) {
            // Persist value
            const page = this.getPage(list, iterator, skip); 
            dc.state.setValue(this.valueProperty, page);

            // Start loop
            return await this.beginAction(dc, 0);
        } else {
            // End of list has been reached
            return await dc.endDialog();
        }
    }
  
    private getPage(list: any[]|object, iterator: number, skip: number): any[] {
        const page: any[] = [];
        const end = iterator + skip;
        if (Array.isArray(list)) {
            for (let i = iterator; i >= iterator && i < end; i++) {
                page.push(list[i]);
            }
        } else if (typeof list === 'object') {
            let i = 0;
            for (const key in list) {
                if (list.hasOwnProperty(key)) {
                    if (i >= iterator && i < end) {
                        page.push(list[key]);
                    }
                    i++;
                }
            }
        }

        return page;
    }
}
