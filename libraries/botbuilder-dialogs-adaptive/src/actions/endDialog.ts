/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'botframework-expressions';

export interface EndDialogConfiguration extends DialogConfiguration {
    /**
     * (Optional) specifies an in-memory state property that should be returned to the calling
     * dialog.
     */
    resultProperty?: string;
}

export class EndDialog<O extends object = {}> extends Dialog<O> {

    public static declarativeType = 'Microsoft.EndDialog';

    private _value: Expression;

    /**
     * Creates a new `EndDialog` instance.
     * @param value (Optional) A value expression for the result to be returned to the caller
     */
    public constructor();
    public constructor(value?: string) {
        super();
        if (value) { this.value = value; }
    }

    /**
     * Get a value expression for the result to be returned to the caller.
     */
    public get value(): string {
        return this._value ? this._value.toString() : undefined;
    }

    /**
     * Set a value expression for the result to be returned to the caller.
     */
    public set value(value: string) {
        this._value = value ? new ExpressionEngine().parse(value): undefined;
    }

    public configure(config: EndDialogConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._value) {
            const { value } = this._value.tryEvaluate(dc.state);
            return await this.endParentDialog(dc, value);
        }

        return await this.endParentDialog(dc);
    }

    protected async endParentDialog(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        if (dc.parent) {
            const turnResult = await dc.parent.endDialog(result);
            turnResult.parentEnded = true;
            return turnResult;
        } else {
            return await dc.endDialog(result);
        }
    }

    protected onComputeId(): string {
        return `EndDialog[${ this.value || '' }]`;
    }
}