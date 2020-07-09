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
import { ExpressionFunctions } from './expressionFunctions';

/**
 * Construct an expression constant.
 */
export class Constant extends Expression {

    // original regex: (?<!\\)'
    private readonly singleQuotRegex: RegExp = new RegExp(/'(?!\\)/g);
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
                        : Array.isArray(theValue) ? ReturnType.Array
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

    
    public  deepEquals(other: Expression): boolean {
        let eq: boolean;
        if (!other || other.type !== this.type) {
            eq = false; 
        } else {
            let otherVal = (other as Constant).value;
            eq = this.value === otherVal;
        }

        return eq;
    }

    public toString(): string {
        
        if (this.value === undefined) {
            return 'null';
        } else if (typeof this.value === 'string') {
            let result = this.value;

            result = result.replace(/\\/g, '\\\\');
            result = this.reverseString(this.reverseString(result).replace(this.singleQuotRegex, (): any => '\'\\'));
            return `'${ result }'`;
        } else if (typeof this.value === 'number') {
            return this.value.toString();
        } else if(typeof this.value === 'object') {
            return JSON.stringify(this.value);
        }

        return this.value.toString();
    }

    private reverseString(str: string | undefined): string {
        if (!str) {
            return str;
        }

        return str.split('').reverse().join('');
    }
}
