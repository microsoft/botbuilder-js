
/**
 * @module botframework-expressions
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
    public get Value(): any {
        return this._value;
    }

    public set Value(theValue: any) {
        this.Evaluator.ReturnType =
            typeof theValue === 'string' ? ReturnType.String
                : typeof theValue === 'boolean' ? ReturnType.Boolean
                : typeof theValue === 'number' && !Number.isNaN(theValue) ? ReturnType.Number
                        : ReturnType.Object;

        this._value = theValue;
    }

    private _value: any;
    public constructor(value: any) {
        super(ExpressionType.Constant, new ExpressionEvaluator(ExpressionType.Constant,
                                                               (expression: Expression, state: any): { value: any; error: string } => {
                return { value: (<Constant>expression).Value, error: undefined };
            }
        ));
        this.Value = value;
    }

    public toString(): string {
        if (this.Value === undefined) {
            return 'null';
        }

        if (typeof this.Value === 'string') {
            return `'${this.Value}'`;
        }

        return this.Value === undefined ? undefined : this.Value.toString();
    }
}
