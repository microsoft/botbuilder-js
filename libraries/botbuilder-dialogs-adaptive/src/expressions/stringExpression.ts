/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionProperty } from './expressionProperty';

/**
 * StringExpression - represents a property which is either a string value or a string expression.
 * @remarks
 * If the value is
 *     * a string with '=' prefix when the string is treated as an expression to resolve to a string.
 *     * a string without '=' then value is treated as string with string interpolation.
 * You can escape the '=' prefix by putting a backslash.
 * Examples:
 *     prop = "Hello ${user.name}" => "Hello Joe"
 *     prop = "=length(user.name)" => "3"
 *     prop = "=user.name" => "Joe"
 *     prop = "\=user" => "=user"
 */
export class StringExpression extends ExpressionProperty<string> {
    public constructor(value: string) {
        super(value);
    }

    public setValue(value: string): void {
        super.setValue(undefined); // reset value and expression

        let stringOrExpression = value;
        if (stringOrExpression.startsWith('=')) {
            this.expressionText = stringOrExpression;
        } else if (stringOrExpression.startsWith('\\=')) {
            this.expressionText = `=\`${ stringOrExpression.substr(1) }\``;
        } else {
            this.expressionText = `=\`${ stringOrExpression }\``;
        }
    }
}