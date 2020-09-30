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
 * Represents a property which is either a string value or a string expression.
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
export class StringExpression extends ExpressionProperty<string> {
    /**
     * Initializes a new instance of the `ArrayExpression<T>` class.
     * @param value A `string` value or a `string` expression.
     */
    public constructor(value?: string | Expression) {
        super(value);
    }

    /**
     * Set a string value.
     * @param value Value to set.
     */
    public setValue(value: string | Expression): void {
        // reset state to no value or expression
        super.setValue(undefined);

        if (value instanceof Expression) {
            super.setValue(value);
            return;
        }

        if (typeof value == 'string') {
            if (value.startsWith('=')) {
                this.expressionText = value;
                return;
            } else if (value.startsWith('\\=')) {
                // Trim off the escape char for equals (\=foo) should simply be the string (=foo).
                value = value.substr(1);
            }

            // Initialize value
            this.expressionText = `=\`${ value.replace(/\\/g, '\\\\') }\``;
            return;
        }
    }
}
