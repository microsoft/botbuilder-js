/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionProperty } from './expressionProperty';

/**
 * ValueExpression - represents a property which is an object of any kind or a string expression.
 * 
 * @remarks
 * If the value is
 *     * a string with '=' prefix then the string is treated as an expression to resolve to a string.
 *     * a string without '=' then value is treated as string with string interpolation.
 *     * any other type, then it is of that type (number, boolean, object, etc.)
 * You can escape the '=' prefix by putting a backslash.
 * Examples:
 *     prop = true => true
 *     prop = "Hello ${user.name}" => "Hello Joe"
 *     prop = "=length(user.name)" => 3
 *     prop = "=user.age" => 45
 *     prop = "\=user.age" => "=user.age"
 */
export class ValueExpression extends ExpressionProperty<any> {
    public constructor(value: any) {
        super(value);
    }

    public setValue(value: any): void {
        super.setValue(undefined); // reset value and expression

        let stringOrExpression: string;
        if (typeof value == 'string') {
            stringOrExpression = value;
            if (stringOrExpression.startsWith('=')) {
                this.expressionText = stringOrExpression;
            } else if (stringOrExpression.startsWith('\\=')) {
                this.expressionText = `=\`${ stringOrExpression.substr(1) }\``;
            } else {
                this.expressionText = `=\`${ stringOrExpression }\``;
            }
            return;
        }

        super.setValue(value);
    }
}