/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Expression, ReturnType } from './expression';
import { ExpressionEvaluator } from './expressionEvaluator';
import { ExpressionType } from './expressionType';

/**
 * Construct an expression constant.
 */
export class Constant extends Expression {

    /**
     * Constant value.
     */
    public get value(): any {
        return this._value;
    }

    public set value(theValue: any) {
        this.evaluator.returnType =
            typeof theValue === 'string' ? ReturnType.String
                : typeof theValue === 'boolean' ? ReturnType.Boolean
                    : typeof theValue === 'number' && !Number.isNaN(theValue) ? ReturnType.Number
                        : ReturnType.Object;

        this._value = theValue;
    }

    private _value: any;
    public constructor(value: any) {
        super(ExpressionType.Constant, new ExpressionEvaluator(ExpressionType.Constant,
            (expression: Expression): { value: any; error: string } => {
                return { value: (expression as Constant).value, error: undefined };
            }
        ));
        this.value = value;
    }

    public toString(): string {
        let result = undefined;
        if (this.value === undefined) {
            result = 'null';
        } else if (typeof this.value === 'string') {
            result = this.value;
            if (result.includes('\\')) {
                result = result.replace(/\\/g, '\\\\');
            }

            result = result.includes(`'`) ? `"${ result }"` : `'${ result }'`;
        } else if (Array.isArray(this.value)) {
            result = '[' + this.value.join(' ') + ']';
        } else if(typeof this.value === 'object') {
            result = JSON.stringify(this.value);
        }

        return result === undefined ? undefined : result.toString();
    }
}
