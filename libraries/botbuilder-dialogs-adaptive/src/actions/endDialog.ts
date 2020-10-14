/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    ValueExpression,
    ValueExpressionConverter,
} from 'adaptive-expressions';
import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';
import { replaceJsonRecursively } from '../jsonExtensions';

export interface EndDialogConfiguration extends DialogConfiguration {
    value?: unknown | ValueExpression;
    disabled?: boolean | string | Expression | BoolExpression;
}

export class EndDialog<O extends object = {}> extends Dialog<O> implements EndDialogConfiguration {
    public static $kind = 'Microsoft.EndDialog';

    /**
     * Creates a new `EndDialog` instance.
     * @param value (Optional) A value expression for the result to be returned to the caller
     */
    public constructor();
    public constructor(value?: any) {
        super();
        if (value) {
            this.value = new ValueExpression(value);
        }
    }

    /**
     * A value expression for the result to be returned to the caller.
     */
    public value: ValueExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverter(property: keyof EndDialogConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'value':
                return new ValueExpressionConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (this.value) {
            let value = this.value.getValue(dc.state);

            if (value) {
                value = replaceJsonRecursively(dc.state, value);
            }

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
        return `EndDialog[${this.value ? this.value.toString() : ''}]`;
    }
}
