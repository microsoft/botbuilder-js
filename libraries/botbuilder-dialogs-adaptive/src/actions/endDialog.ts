/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog, Configurable } from 'botbuilder-dialogs';
import { ValueExpression, BoolExpression } from '../expressionProperties';

export interface EndDialogConfiguration extends DialogConfiguration {
    value?: any;
    disabled?: string | boolean;
}

export class EndDialog<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.EndDialog';

    /**
     * Creates a new `EndDialog` instance.
     * @param value (Optional) A value expression for the result to be returned to the caller
     */
    public constructor();
    public constructor(value?: any) {
        super();
        if (value) { this.value = new ValueExpression(value); }
    }

    /**
     * A value expression for the result to be returned to the caller.
     */
    public value: ValueExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public configure(config: EndDialogConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'value':
                        this.value = new ValueExpression(value);
                        break;
                    case 'disabled':
                        this.disabled = new BoolExpression(value);
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (this.value) {
            const value = this.value.getValue(dc.state);
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
        return `EndDialog[${ this.value.toString() || '' }]`;
    }
}