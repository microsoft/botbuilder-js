/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression } from 'adaptive-expressions';

/**
 * Deletes a property from memory.
 */
export class DeleteProperties<O extends object = {}> extends Dialog<O> {
    public constructor();

    /**
     * Initializes a new instance of the `DeleteProperties` class.
     * @param properties Optional. Collection of property paths to remove.
     */
    public constructor(properties?: string[]) {
        super();
        if (properties) {
            this.properties = properties.map((property): StringExpression => new StringExpression(property));
        }
    }

    /**
     * Collection of property paths to remove.
     */
    public properties: StringExpression[] = [];

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (this.properties && this.properties.length > 0) {
            for (let i = 0; i < this.properties.length; i++) {
                dc.state.deleteValue(this.properties[i].getValue(dc.state));
            }
        }

        return await dc.endDialog();
    }

    /**
     * @protected
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `DeleteProperties[${ this.properties.map((property): string => property.toString()).join(',') }]`;
    }
}
