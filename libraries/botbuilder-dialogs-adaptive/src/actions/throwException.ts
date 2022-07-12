/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolProperty, UnknownProperty } from '../properties';

import {
    BoolExpression,
    BoolExpressionConverter,
    ValueExpression,
    ValueExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogEvents,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export interface ThrowExceptionConfiguration extends DialogConfiguration {
    disabled?: BoolProperty;
    errorValue?: UnknownProperty;
}

/**
 * Action which throws an exception declaratively.
 */
export class ThrowException extends Dialog implements ThrowExceptionConfiguration {
    static $kind = 'Microsoft.ThrowException';

    /**
     * Initializes a new instance of the [ThrowException](xref:botbuilder-dialogs-adaptive.ThrowException) class.
     *
     * @param errorValue Optional. Memory property path to use to get the error value to throw.
     */
    constructor(errorValue: unknown) {
        super();
        if (errorValue) {
            this.errorValue = new ValueExpression(errorValue);
        }
    }

    /**
     * Gets or sets an optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * Gets or sets the memory property path to use to get the error value to throw.
     */
    errorValue?: ValueExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof ThrowExceptionConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'errorValue':
                return new ValueExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: Record<string, unknown>): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return dc.endDialog();
        }

        let value: unknown;
        if (this.errorValue) {
            value = this.errorValue.getValue(dc.state);
        }
        throw new Error(value && `${value}`);
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `ThrowException[${DialogEvents.error}]`;
    }
}
