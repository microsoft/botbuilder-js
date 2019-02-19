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
     * @param entityName Name of the entity to save.
     * @param property In-memory state property to save the entity to.
     */
    constructor();
    constructor(entityName: string, property: string);
    constructor(entityName?: string, property?: string) {
        super();
        if (entityName) { this.entityName = entityName }
        if (property) { this.property = property }
    }

    protected onComputeID(): string {
        return `saveEntity(${this.entityName}, ${this.property})`;
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
        super.configure(config);
        if (config.entityName) { this.entityName = config.entityName }
        if (config.property) { this.property = config.property }
        return this;
    }

    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        // Get entity
        const values: string[] = dc.state.getValue(`dialog.options.entities.${this.entityName}`);
        if (Array.isArray(values) && values.length > 0) {
            // Map value to property
            dc.state.setValue(this.property, values[0]);
        }
        return await dc.endDialog();
    }
}