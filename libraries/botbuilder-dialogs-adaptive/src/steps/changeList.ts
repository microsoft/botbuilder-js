/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, DialogContext, DialogConfiguration } from 'botbuilder-dialogs';

export interface ChangeListConfiguration extends DialogConfiguration {
    changeType?: ChangeListType;

    listProperty?: string;
    
    itemProperty?: string;
}

export enum ChangeListType {
    push = 'push',
    pop = 'pop',
    take = 'take',
    remove = 'remove',
    clear = 'clear'
}

export class ChangeList extends DialogCommand {

    constructor();
    constructor(changeType: ChangeListType, listProperty: string, itemProperty?: string);
    constructor(changeType?: ChangeListType, listProperty?: string, itemProperty?: string) {
        super();
        if (changeType) { this.changeType = changeType }
        if (listProperty) { this.listProperty = listProperty }
        if (itemProperty) { this.itemProperty = itemProperty }
    }
    
    protected onComputeID(): string {
        return `list[${this.hashedLabel(this.changeType + ': ' + this.listProperty)}]`;
    }

    public changeType: ChangeListType;

    public listProperty: string;
    
    public itemProperty: string;

    public configure(config: ChangeListConfiguration): this {
        return super.configure(config);
    }

    protected async onRunCommand(dc: DialogContext, options: object): Promise<DialogTurnResult> {
        if (!this.listProperty) { throw new Error(`ChangeList: "${this.changeType}" operation couldn't be performed because the listProperty wasn't specified.`) }

        // Get list and ensure populated
        let list: any[] = dc.state.getValue(this.listProperty);
        if (!Array.isArray(list)) { list = [] }

        // Manipulate list
        let item: any;
        let serialized: string;
        let lastResult: any;
        switch (this.changeType) {
            case ChangeListType.pop:
                item = list.pop();
                if (this.itemProperty) {
                    dc.state.setValue(this.itemProperty, item);
                }
                lastResult = item;
                break;
            case ChangeListType.push:
                this.ensureItemProperty();
                item = dc.state.getValue(this.itemProperty);
                lastResult = item != undefined;
                if (lastResult) {
                    list.push(item);
                }
                break;
            case ChangeListType.take:
                item = list.shift();
                if (this.itemProperty) {
                    dc.state.setValue(this.itemProperty, item);
                }
                lastResult = item;
                break;
            case ChangeListType.remove:
                this.ensureItemProperty();
                item = dc.state.getValue(this.itemProperty);
                if (item != undefined) {
                    serialized = Array.isArray(item) || typeof item == 'object' ? JSON.stringify(item) : undefined;
                    lastResult = false;
                    for (let i = 0; i < list.length; i++) {
                        if ((serialized && JSON.stringify(list[i]) == serialized) || item === list[i]) {
                            list.splice(i, 1);
                            lastResult = true;
                            break;
                        } 
                    }
                }
                break;
            case ChangeListType.clear:
                lastResult = list.length > 0;
                list = [];
                break;
        }

        // Save list and last result
        dc.state.setValue(this.listProperty, list);
        dc.state.setValue('dialog.lastResult', lastResult);
        return await dc.endDialog();
    }

    private ensureItemProperty(): void {
        if (!this.itemProperty) { throw new Error(`ChangeList: "${this.changeType}" operation couldn't be performed for list "${this.listProperty}" because an itemProperty wasn't specified.`) }
    }
}