/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogContext } from 'botbuilder-dialogs';
import { ActionScope, ActionScopeResult, ActionScopeConfiguration } from './actionScope';
import { StringExpression, BoolExpression, NumberExpression } from '../expressionProperties';

const FOREACHPAGE = 'dialog.foreach.page';
const FOREACHPAGEINDEX = 'dialog.foreach.pageindex';

/**
 * Configuration info passed to a `ForEachPage` action.
 */
export interface ForEachPageConfiguration extends ActionScopeConfiguration {
    itemsProperty?: string;
    pageSize?: string | number;
    disabled?: string | boolean;
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
    public static declarativeType = 'Microsoft.ForeachPage';

    public constructor();
    public constructor(itemsProperty?: string, pageSize: number = 10) {
        super();
        if (itemsProperty) { this.itemsProperty = new StringExpression(itemsProperty); }
        this.pageSize = new NumberExpression(pageSize);
    }

    /**
     * Expression used to compute the list that should be enumerated.
     */
    public itemsProperty: StringExpression;

    /**
     * Page size, default to 10.
     */
    public pageSize: NumberExpression = new NumberExpression(10) ;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getDependencies(): Dialog[] {
        return this.actions;
    }

    public configure(config: ForEachPageConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'itemsProperty':
                        this.itemsProperty = new StringExpression(value);
                        break;
                    case 'pageSize':
                        this.pageSize = new NumberExpression(value);
                        break;
                    case 'disabled':
                        this.disabled = new BoolExpression(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }
        return await this.nextPage(dc);
    }

    protected async onEndOfActions(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        return await this.nextPage(dc);
    }

    protected async onBreakLoop(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        return await dc.endDialog();
    }

    protected async onContinueLoop(dc: DialogContext, actionScopeResult: ActionScopeResult): Promise<DialogTurnResult> {
        return await this.nextPage(dc);
    }

    protected onComputeId(): string {
        return `ForEachPage[${ this.itemsProperty.toString() }]`;
    }

    private async nextPage(dc: DialogContext): Promise<DialogTurnResult> {
        let pageIndex = dc.state.getValue(FOREACHPAGEINDEX, 0);
        const pageSize = this.pageSize.getValue(dc.state);
        const itemOffset = pageSize * pageIndex;

        const itemsProperty = this.itemsProperty.getValue(dc.state);
        const items: any[] = dc.state.getValue(itemsProperty, []);
        if (items.length > 0) {
            const page = this.getPage(items, itemOffset, pageSize);
            if (page && page.length > 0) {
                dc.state.setValue(FOREACHPAGE, page);
                dc.state.setValue(FOREACHPAGEINDEX, ++pageIndex);
                return await this.beginAction(dc, 0);
            }
        }
        return await dc.endDialog();
    }

    private getPage(list: any[] | object, index: number, pageSize: number): any[] {
        const page: any[] = [];
        const end = index + pageSize;
        if (Array.isArray(list)) {
            for (let i = index; i < list.length && i < end; i++) {
                page.push(list[i]);
            }
        } else if (typeof list === 'object') {
            let i = index;
            for (const key in list) {
                if (list.hasOwnProperty(key)) {
                    if (i < end) {
                        page.push(list[key]);
                    }
                    i++;
                }
            }
        }
        return page;
    }
}
