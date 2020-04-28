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

    public constructor(value?: string | Expression) {
        super(value);
    }

    public tryGetValue(data: object): { value: string; error: Error } {
        if (typeof this.value == 'string') {
            let v: any, e: string;
            const expressionStr = '`' + this.value + '`';
            ({value: v, error: e} = Expression.parse(expressionStr).tryEvaluate(data));

            return e == undefined ? { value: v as string, error: undefined } : { value: v as string, error: new Error(e) };
        }

        return super.tryGetValue(data);
    }
    
    public setValue(value: string | Expression): void {
        this.value = undefined;
        this.expression = undefined;

        if (typeof value == 'string' && !value.startsWith('=')) {
            // Trim off the escape char for equals (\=foo) should simply be the string (=foo).
            if (value.startsWith('\\=')) {
                value = value.substr(1);
            }

            // Initialize value
            this.value = value;
            this.expression = undefined;
            return;
        }

        super.setValue(value);
    }
}