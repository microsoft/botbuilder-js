/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, Dialog, DialogCommand, DialogContext } from 'botbuilder-dialogs';

export interface SaveEntityConfiguration extends DialogConfiguration {
    /**
     * Entity to look for.
     */
    entityName?: string;

    /**
     * Property to save the entity to.
     */
    property?: string;
}

export class SaveEntity extends DialogCommand {

    /**
     * Creates a new `SaveEntity` instance.
     * @param property In-memory state property to save the entity to.
     * @param entityName Name of the entity to save.
     */
    constructor();
    constructor(property: string, entityName: string);
    constructor(property?: string, entityName?: string) {
        super();
        if (entityName) { this.entityName = entityName }
        if (property) { this.property = property }
    }

    protected onComputeID(): string {
        return `saveEntity[${this.hashedLabel(this.entityName + ':' + this.property)}]`;
    }

    /**
     * Entity to look for.
     */
    public entityName: string;

    /**
     * Property to save the entity to.
     */
    public property: string;

    public configure(config: SaveEntityConfiguration): this {
        return super.configure(config);
    }

    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        // Get entity
        const values: any|any[] = dc.state.getValue(this.entityName);
        if (Array.isArray(values) && values.length > 0) {
            // Save first value to property
            dc.state.setValue(this.property, values[0]);
        } else if (values !== undefined) {
            dc.state.setValue(this.property, values);
        }
        return await dc.endDialog();
    }
}