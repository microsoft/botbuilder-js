/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Expression } from './expression';
import { ReturnType } from './returnType';
import { ExpressionEvaluator, ValueWithError } from './expressionEvaluator';
import { ExpressionType } from './expressionType';

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

    /**
     * Sets constant value.
     */
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

    /**
     * Initializes a new instance of the `Constant` class.
     * Constructs an expression constant.
     * @param value Constant value.
     */
    public constructor(value: any) {
        super(ExpressionType.Constant, new ExpressionEvaluator(ExpressionType.Constant,
            (expression: Expression): ValueWithError => {
                return { value: (expression as Constant).value, error: undefined };
            }
        ));
        this.value = value;
    }

    /**
     * Determines if the current Expression instance is deep equal to another one.
     * @param other The other Expression instance to compare.
     * @returns A boolean value indicating whether the two Expressions are deep equal (`true`) or not (`false`).
     */
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

    /**
     * Returns a string that represents the current constant object.
     * @returns A string that represents the current constant object.
     */
    public toString(): string {
        
        if (this.value === undefined) {
            return 'undefined';
        } else if (this.value === null) {
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

    /**
     * @private
     */
    private reverseString(str: string | undefined): string {
        if (!str) {
            return str;
        }

        return str.split('').reverse().join('');
    }
}
