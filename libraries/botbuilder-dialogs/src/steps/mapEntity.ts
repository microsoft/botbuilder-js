/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand } from '../dialogCommand';
import { DialogContext } from '../dialogContext';
import { DialogTurnResult, DialogConfiguration, Dialog } from '../dialog';

export class MapEntity extends DialogCommand {

    protected onComputeID(): string {
        return `map(${this.entityName}, ${this.property})`;
    }

    /**
     * Entity to look for.
     */
    public entityName: string;

    /**
     * Property to map the entity to.
     */
    public property: string;

    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        // Get entity
        const values: string[] = dc.state.getValue(`dialog.options.entities.${this.entityName}`);
        if (Array.isArray(values) && values.length > 0) {
            // Map value to property
            dc.state.setValue(this.property, values[0]);
        }
        return await dc.endDialog();
    }

    static create(entityName: string, property: string, config?: DialogConfiguration): MapEntity {
        const dialog = new MapEntity();
        dialog.entityName= entityName;
        dialog.property = property;
        if (config) {
            Dialog.configure(dialog, config);
        }
        return dialog;
    }
}