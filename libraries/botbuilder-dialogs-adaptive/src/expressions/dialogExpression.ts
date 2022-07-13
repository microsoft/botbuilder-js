/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Expression, ExpressionProperty } from 'adaptive-expressions';
import { Dialog } from 'botbuilder-dialogs';

/**
 * Represents a property which is either a [Dialog](xref:botbuilder-dialogs.Dialog) or a string expression for a dialogId.
 *
 * @remarks
 * String values are always interpreted as a string with interpolation, unless it has '=' prefix
 * or not. The result is interpreted as a resource Id or dialogId.
 */
export class DialogExpression extends ExpressionProperty<Dialog> {
    /**
     * Initializes a new instance of the [DialogExpression](xref:botbuilder-dialogs-adaptive.DialogExpression) class.
     *
     * @param value Optional. A [Dialog](xref:botbuilder-dialogs.Dialog), a `string` that is interpreted as a resource Id or dialogId, or an [Expression](xref:adaptive-expressions.Expression).
     */
    constructor(value?: Dialog | string | Expression) {
        super(value);
    }

    /**
     * Sets the raw value of the expression property.
     *
     * @param value A [Dialog](xref:botbuilder-dialogs.Dialog), a `string` that is interpreted as a resource Id or dialogId, or an [Expression](xref:adaptive-expressions.Expression).
     */
    setValue(value: Dialog | string | Expression): void {
        if (typeof value == 'string' && !value.startsWith('=')) {
            // Resource Id's will be resolved to actual dialog value
            // if it's not a = then we want to convert to a constant string expressions to represent a
            // external dialog id resolved by dc.FindDialog()
            value = `='${value}'`;
        }

        super.setValue(value);
    }
}
