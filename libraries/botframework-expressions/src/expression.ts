/**
 * @module botframework-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BuiltInFunctions } from './builtInFunction';
import { Constant } from './constant';
import { ExpressionEvaluator, EvaluateExpressionDelegate } from './expressionEvaluator';
import { ExpressionType } from './expressionType';
import { SimpleObjectMemory, MemoryInterface } from './memory';
import { Extensions } from './extensions';

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
     * Construct an expression from a EvaluateExpressionDelegate
     * @param func Function to create an expression from.
     */
    public static lambaExpression(func: EvaluateExpressionDelegate): Expression {
        return new Expression(ExpressionType.Lambda, new ExpressionEvaluator(ExpressionType.Lambda, func));
    }

    /**	
     * Construct an expression from a lamba expression over the state.
     * Exceptions will be caught and surfaced as an error string.
     * @param func ambda expression to evaluate.
     * @returns New expression.
     */	
    public static lambda(func: (arg0: any) => any): Expression {
        return new Expression(ExpressionType.Lambda, new ExpressionEvaluator(ExpressionType.Lambda,
            (_expression: Expression, state: any): { value: any; error: string } => {
                let value: any;
                let error: string;
                try {
                    value = func(state);
                } catch (funcError) {
                    error = funcError;
                }

                return { value, error };
            }
        ));
    }

    /**
     * Construct and validate an Set a property expression to a value expression.
     * @param property property expression.
     * @param value value expression.
     * @returns New expression.
     */
    public static setPathToValue(property: Expression, value: any): Expression {
        if (value instanceof Expression) {
            return Expression.makeExpression(ExpressionType.SetPathToValue, undefined, property, value);
        } else {
            return Expression.makeExpression(ExpressionType.SetPathToValue, undefined, property, new Constant(value));
        }
    }


    /**
     * Construct and validate an Equals expression.
     * @param children Child clauses.
     * @returns New expression.
     */
    public static equalsExpression(...children: Expression[]): Expression {
        return Expression.makeExpression(ExpressionType.Equal, undefined, ...children);
    }

    /**
     * Construct and validate an And expression.
     * @param children Child clauses.
     * @returns New expression.
     */
    public static andExpression(...children: Expression[]): Expression {
        if (children.length > 1) {
            return Expression.makeExpression(ExpressionType.And, undefined, ...children);
        } else {
            return children[0];
        }
    }

    /**
     * Construct and validate an Or expression.
     * @param children Child clauses.
     * @returns New expression.
     */
    public static orExpression(...children: Expression[]): Expression {
        if (children.length > 1) {
            return Expression.makeExpression(ExpressionType.Or, undefined, ...children);
        } else {
            return children[0];
        }
    }

    /**
     * Construct and validate an Not expression.
     * @param children Child clauses.
     * @returns New expression.
     */	
    public static notExpression(child: Expression): Expression {
        return Expression.makeExpression(ExpressionType.Not, undefined, child);
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
    public tryEvaluate(state: MemoryInterface | any): { value: any; error: string } {
        if(!Extensions.isMemoryInterface(state)) {
            state = SimpleObjectMemory.wrap(state);
        }
        return this.evaluator.tryEvaluate(this, state);
    }

    public toString(): string {
        let builder = '';
        let valid = false;
        // Special support for memory paths
        if (this.type === ExpressionType.Accessor && this.children.length >= 1) {
            if (this.children[0] instanceof Constant) {
                const prop: any = (this.children[0] as Constant).value;
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
            let first = true;
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
