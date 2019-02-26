/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, DialogContext, DialogConfiguration } from 'botbuilder-dialogs';

export interface PropertyConfiguration extends DialogConfiguration {
    property?: string;
    manipulations?: PropertyManipulation[];
}

export interface PropertyManipulation {
    type: PropertyManipulationType;
    value?: any;
    property?: string;
}

export enum PropertyManipulationType {
    copyTo = 'copyTo',
    decrement = 'decrement',
    defaultTo = 'defaultTo',
    increment = 'increment',
    set = 'set',
    swapWith = 'swapWith'
}

export class Property extends DialogCommand {

    constructor(property?: string) {
        super();
        if (property) { this.property = property }
    }

    protected onComputeID(): string {
        const types = this.manipulations.map((change) => change.type);
        return `property[${this.hashedLabel(this.bindingPath(false) + ':' + types.join(','))}]`;
    }

    public property: string;

    public manipulations: PropertyManipulation[] = [];

    public copyTo(property: string): this {
        this.manipulations.push({ type: PropertyManipulationType.copyTo, property: property });
        return this;
    }

    public decrement(): this {
        this.manipulations.push({ type: PropertyManipulationType.decrement });
        return this;
    }

    public defaultTo(value: any): this {
        this.manipulations.push({ type: PropertyManipulationType.defaultTo, value: value });
        return this;
    }

    public increment(): this {
        this.manipulations.push({ type: PropertyManipulationType.increment });
        return this;
    }

    public set(value: any): this {
        this.manipulations.push({ type: PropertyManipulationType.set, value: value });
        return this;
    }

    public swapWith(property: string): this {
        this.manipulations.push({ type: PropertyManipulationType.swapWith, property: property });
        return this;
    }

    public configure(config: PropertyConfiguration): this {
        return super.configure(config);
    }
    
    protected async onRunCommand(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        // Process property manipulation(s)
        const value = dc.state.getValue(this.property);
        for (let i = 0; i < this.manipulations.length; i++) {
            const change = this.manipulations[i];
            switch (change.type) {
                case PropertyManipulationType.copyTo:
                    dc.state.setValue(change.property, value);
                    break;
                case PropertyManipulationType.decrement:
                    dc.state.setValue(this.property, typeof value == 'number' ? value - 1 : -1);
                    break;
                case PropertyManipulationType.defaultTo:
                    if (value === undefined) {
                        dc.state.setValue(this.property, change.value);
                    }
                    break;
                case PropertyManipulationType.increment:
                    dc.state.setValue(this.property, typeof value == 'number' ? value + 1 : 1);
                    break;
                case PropertyManipulationType.set:
                    dc.state.setValue(this.property, change.value);
                    break;
                case PropertyManipulationType.swapWith:
                    const other = dc.state.getValue(change.property);
                    dc.state.setValue(change.property, value);
                    dc.state.setValue(this.property, other);
                    break;
            }
        }

        return await dc.endDialog();
    }
}
