/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, DialogContext, DialogConfiguration } from 'botbuilder-dialogs';

export interface ChangeCollectionConfiguration extends DialogConfiguration {
    changeType?: ChangeCollectionType;

    collectionProperty?: string;

    keyProperty?: string;
    
    itemProperty?: string;
}

export enum ChangeCollectionType {
    set = 'set',
    remove = 'remove',
    clear = 'clear'
}

export class ChangeCollection extends DialogCommand {

    constructor();
    constructor(changeType: ChangeCollectionType, collectionProperty: string, keyProperty: string, itemProperty?: string);
    constructor(changeType?: ChangeCollectionType, collectionProperty?: string, keyProperty?: string, itemProperty?: string) {
        super();
        if (changeType) { this.changeType = changeType }
        if (collectionProperty) { this.collectionProperty = collectionProperty }
        if (keyProperty) { this.keyProperty = keyProperty }
        if (itemProperty) { this.itemProperty = itemProperty }
    }
    
    protected onComputeID(): string {
        return `collection[${this.hashedLabel(this.changeType + ': ' + this.collectionProperty)}]`;
    }

    public changeType: ChangeCollectionType;

    public collectionProperty: string;
    
    public keyProperty: string;

    public itemProperty: string;

    public configure(config: ChangeCollectionConfiguration): this {
        return super.configure(config);
    }

    protected async onRunCommand(dc: DialogContext, options: object): Promise<DialogTurnResult> {
        if (!this.collectionProperty) { throw new Error(`ChangeCollection: "${this.changeType}" operation couldn't be performed because the collectionProperty wasn't specified.`) }
        if (!this.keyProperty) { throw new Error(`ChangeCollection: "${this.changeType}" operation couldn't be performed for collection "${this.collectionProperty}" because a keyProperty wasn't specified.`) }

        // Get collection and ensure populated
        let collection: object = dc.state.getValue(this.collectionProperty);
        if (typeof collection !== 'object') { collection = {} }

        // Get key
        let lastResult = false;
        const key = dc.state.getValue(this.keyProperty);
        if (typeof key == 'string') {
            // Manipulate collection
            let item: any;
            switch (this.changeType) {
                case ChangeCollectionType.set:
                    if (!this.itemProperty) { throw new Error(`ChangeCollection: "set" operation couldn't be performed for collection "${this.collectionProperty}" because an itemProperty wasn't specified.`) }
                    item = dc.state.getValue(this.itemProperty);
                    lastResult = item !== undefined;
                    if (lastResult) {
                        collection[key] = item;
                    }
                    break;
                case ChangeCollectionType.remove:
                    if (collection.hasOwnProperty(key)) {
                        delete collection[key];
                        lastResult = true;
                    }
                    break;
                case ChangeCollectionType.clear:
                    for(const k in collection) {
                        if (collection.hasOwnProperty(k)) {
                            lastResult = true;
                            break;
                        }
                    }
                    collection = {};
                    break;
            }
        }


        // Save list and last result
        dc.state.setValue(this.collectionProperty, collection);
        dc.state.setValue('dialog.lastResult', lastResult);
        return await dc.endDialog();
    }
}