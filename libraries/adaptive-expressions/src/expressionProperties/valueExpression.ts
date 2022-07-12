/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionProperty } from './expressionProperty';
import { Expression } from '../expression';

/**
 * Represents a property which is an object of any kind or a string expression.
 *
 * @remarks
 * If the value is
 * - a string with '=' prefix then the string is treated as an expression to resolve to a string.
 * - a string without '=' then value is treated as string with string interpolation.
 * - You can escape the '=' prefix by putting a backslash.
 * Examples:
 *     prop = "Hello @{user.name}" => "Hello Joe"
 *     prop = "=length(user.name)" => "3"
 *     prop = "=user.name" => "Joe"
 *     prop = "\=user" => "=user".
 */
export class ValueExpression extends ExpressionProperty<any> {
    /**
     * Initializes a new instance of the [ValueExpression](xref:adaptive-expressions.ValueExpression) class.
     *
     * @param value An object of `any` kind or a `string` expression.
     */
    constructor(value?: any | string | Expression) {
        super(value);
    }

    /**
     * Set value as value expression.
     *
     * @param value Value to set.
     */
    setValue(value: any | string | Expression): void {
        super.setValue(undefined);

        if (typeof value == 'string') {
            if (value.startsWith('=')) {
                this.expressionText = value;
                return;
            } else if (value.startsWith('\\=')) {
                // Trim off the escape char for equals (\=foo) should simply be the string (=foo).
                value = value.substr(1);
            }

            // keep the string as quoted expression, which will be literal unless string interpolation is used.
            this.expressionText = `=\`${value.replace('`', '\\`')}\``;
            return;
        }

        super.setValue(value);
    }
}
