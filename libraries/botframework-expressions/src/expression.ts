
/**
 * @module botframework-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BuiltInFunctions } from './builtInFunction';
import { Constant } from './constant';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from './expressionEvaluator';
import { ExpressionType } from './expressionType';

/**
 * Type expected from evalating an expression.
 */
export enum ReturnType {
    /**
     * True or false boolean value.
     */
    Boolean = 'boolean',

    /**
     * Numerical value like int, float, double, ...
     */
    Number = 'number',

    /**
     * Any value is possible.
     */
    Object = 'object',

    /**
     * String value.
     */
    String = 'string'
}

/**
 * An expression which can be analyzed or evaluated to produce a value.
 * This provides an open-ended wrapper that supports a number of built-in functions and can also be extended at runtime.
 * It also supports validation of the correctness of an expression and evaluation that should be exception free.
 */
export class Expression {

    /**
     * Expected result of evaluating expression.
     */
    public get returnType(): ReturnType {
        return this.evaluator.returnType;
    }

    /**
     * Type of expression.
     */
    public get type(): string {
        return this.evaluator.type;
    }

    /**
     * Children expressions.
     */
    public children: Expression[];

    protected readonly evaluator: ExpressionEvaluator;

    /**
     * xpression constructor.
     * @param type Type of expression from ExpressionType
     * @param evaluator Information about how to validate and evaluate expression.
     * @param children Child expressions.
     */
    public constructor(type: string, evaluator: ExpressionEvaluator, ...children: Expression[]) {
        this.evaluator = evaluator === undefined ? BuiltInFunctions.lookup(type) : evaluator;
        this.children = children;
    }

    /**
     * Make an expression and validate it.
     * @param type Type of expression from ExpressionType
     * @param evaluator Information about how to validate and evaluate expression.
     * @param children Child expressions.
     */
    public static makeExpression(type: string, evaluator: ExpressionEvaluator, ...children: Expression[]): Expression {
        const expr: Expression = new Expression(type, evaluator, ...children);
        expr.validate();

        return expr;
    }

    /**
     * Validate immediate expression.
     */
    // tslint:disable-next-line: no-void-expression
    public validate = (): void => this.evaluator.validateExpression(this);

    /**
     * Recursively validate the expression tree.
     */
    public validateTree(): void {
        this.validate();
        for (const child of this.children) {
            child.validateTree();
        }
    }

    /**
     * Evaluate the expression.
     * Global state to evaluate accessor expressions against.  Can Dictionary be otherwise reflection is used to access property and then indexer.
     * @param state
     */
    public tryEvaluate(state: any): { value: any; error: string } {
        return this.evaluator.tryEvaluate(this, state);
    }

    public toString(): string {
        let builder: string = '';
        let valid: boolean = false;
        // Special support for memory paths
        if (this.type === ExpressionType.Accessor && this.children.length >= 1) {
            if (this.children[0] instanceof Constant) {
                const prop: any = (<Constant>(this.children[0])).value;
                if (typeof prop === 'string') {
                    if (this.children.length === 1) {
                        valid = true;
                        builder = builder.concat(prop);
                    } else if (this.children.length === 2) {
                        valid = true;
                        builder = builder.concat(this.children[1].toString(), '.', prop);
                    }
                }
            }
        } else if (this.type === ExpressionType.Element && this.children.length === 2) {
            valid = true;
            builder = builder.concat(this.children[0].toString(), '[', this.children[1].toString(), ']');
        }

        if (!valid) {
            const infix: boolean = this.type.length > 0 && !new RegExp(/[a-z]/i).test(this.type[0]) && this.children.length >= 2;
            if (!infix) {
                builder = builder.concat(this.type);
            }
            builder = builder.concat('(');
            let first: boolean = true;
            for (const child of this.children) {
                if (first) {
                    first = false;
                } else {
                    if (infix) {
                        builder = builder.concat(' ', this.type, ' ');
                    } else {
                        builder = builder.concat(', ');
                    }
                }
                builder = builder.concat(child.toString());
            }
            builder = builder.concat(')');
        }

        return builder;
    }
}
