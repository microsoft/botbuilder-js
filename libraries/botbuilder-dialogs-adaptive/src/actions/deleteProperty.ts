/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog, Configurable } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'botframework-expressions';

export interface DeletePropertyConfiguration extends DialogConfiguration {
    /**
     * The property to delete.
     */
    property?: string;

    disabled?: string;
}

export class DeleteProperty<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.DeleteProperty';

    /**
     * Creates a new `DeleteProperty` instance.
     * @param property (Optional) property to delete.
     */
    public constructor();
    public constructor(property?: string) {
        super();
        if (property) { this.property = property; }
    }

    /**
     * The property to delete.
     */
    public property: string;

    /**
     * Get an optional expression which if is true will disable this action.
     */
    public get disabled(): string {
        return this._disabled ? this._disabled.toString() : undefined;
    }

    /**
     * Set an optional expression which if is true will disable this action.
     */
    public set disabled(value: string) {
        this._disabled = value ? new ExpressionEngine().parse(value) : undefined;
    }

    private _disabled: Expression;

    public configure(config: DeletePropertyConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        dc.state.deleteValue(this.property);
        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `DeleteProperty[${ this.property }]`;
    }
}
