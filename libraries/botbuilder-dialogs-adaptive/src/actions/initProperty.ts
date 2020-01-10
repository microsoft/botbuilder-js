/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog, Configurable } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'botframework-expressions';

export interface InitPropertyConfiguration extends DialogConfiguration {
    /**
     * The in-memory property to set.
     */
    property?: string;

    /**
     * Gets or sets type, either Array or Object.
     */
    type?: string;

    disabled?: string;
}

export class InitProperty<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.InitProperty';

    /**
     * Creates a new `Init` instance.
     * @param property The in-memory property to set.
     * @param type Type, either Array or Object.
     */
    public constructor();
    public constructor(property: string, type: string);
    public constructor(property?: string, type?: string) {
        super();
        if (property) { this.property = property; }
        if (type) { this.type = type; }
    }

    /**
     * The in-memory property to set.
     */
    public property: string;

    /**
     * Gets or sets type, either Array or Object. Type, either Array or Object.
     */
    public type?: string;

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

    public configure(config: InitPropertyConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        if (!this.property) { throw new Error(`${ this.id }: no 'property' specified.`); }
        if (!this.type) { throw new Error(`${ this.id }: no 'type' specified.`); }

        switch (this.type.toLowerCase()) {
            case 'array':
                dc.state.setValue(this.property, []);
                break;
            case 'object':
                dc.state.setValue(this.property, {});
                break;
        }

        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `InitProperty[${ this.property }]`;
    }
}
