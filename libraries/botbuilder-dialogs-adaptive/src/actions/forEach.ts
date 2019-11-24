/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogContext } from 'botbuilder-dialogs';
import { ExpressionPropertyValue, ExpressionProperty } from '../expressionProperty';
import { ActionScope, ActionScopeConfiguration } from './actionScope';

/**
 * @private
 */
const LIST_KEY: string = 'this.list';

/**
 * @private
 */
const COUNT_KEY: string = 'this.count';

/**
 * @private
 */
const ITERATOR_KEY: string = 'this.iterator';

/**
 * Configuration info passed to a `ForEach` action.
 */
export interface ForEachConfiguration extends ActionScopeConfiguration {
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
}

/**
 * Executes a set of actions once for each item in an in-memory list or collection.
 *
 * @remarks
 * Each iteration of the loop will store an item from the list or collection at [property](#property)
 * to `dialog.item`. The loop can be exited early by including either a `EndDialog` or `GotoDialog`
 * action.
 */
export class ForEach<O extends object = {}> extends ActionScope<O> {

    /**
     * Creates a new `ForEach` instance.
     * @param list Expression used to compute the list that should be enumerated.
     * @param actions Actions to be run for each page of items.
     */
    constructor();
    constructor(list: ExpressionPropertyValue<any[]|object>, actions: Dialog[]);
    constructor(list?: ExpressionPropertyValue<any[]|object>, actions?: Dialog[]) {
        super(actions);
        if (list) { this.list = new ExpressionProperty(list) }
    }

    protected onComputeId(): string {
        const label = this.list ? this.list.toString() : '';
        return `ForEach[${label}]`;
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

        // Initialize persisted state
        dc.state.setValue(LIST_KEY, list);
        dc.state.setValue(COUNT_KEY, count);
        dc.state.setValue(ITERATOR_KEY, -1);
        dc.state.setValue(this.indexProperty, undefined);
        dc.state.setValue(this.valueProperty, undefined);

        // Start loop for first item
        return await this.nextItem(dc);
    }

    protected async onBreak(dc: DialogContext): Promise<DialogTurnResult> {
        return await dc.endDialog();
    }

    protected async onContinue(dc: DialogContext): Promise<DialogTurnResult> {
        return await this.nextItem(dc);
    }

    protected async onEndOfActions(dc: DialogContext): Promise<DialogTurnResult> {
        return await this.nextItem(dc);
    }

    private async nextItem(dc: DialogContext): Promise<DialogTurnResult> {
        // Get list information
        const list: any[]|object = dc.state.getValue(LIST_KEY);
        const count: number = dc.state.getValue(COUNT_KEY);
        let iterator: number = dc.state.getValue(ITERATOR_KEY);

        // Next item
        if (++iterator < count) {
            // Persist index and value
            const { index, value } = this.getItem(list, iterator); 
            dc.state.setValue(this.indexProperty, index);
            dc.state.setValue(this.valueProperty, value);

            // Start loop
            return await this.beginAction(dc, 0);
        } else {
            // End of list has been reached
            return await dc.endDialog();
        }
    }

    private getItem(list: any[]|object, iterator: number): ItemPair {
        if (Array.isArray(list)) {
            return { index: iterator, value: list[iterator] };
        } else {
            let i = 0;
            const result = {} as ItemPair;
            for (const key in list) {
                if (list.hasOwnProperty(key)) {
                    if (i++ == iterator) {
                        result.index = key;
                        result.value = list[key];
                    }
                }
            }

            return result;
        }
    }
}

interface ItemPair {
    index: string|number;
    value: any;
}
