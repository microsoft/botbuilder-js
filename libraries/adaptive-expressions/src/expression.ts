/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Constant } from './constant';
import {
    EvaluateExpressionDelegate,
    EvaluatorLookup,
    ExpressionEvaluator,
    ValueWithError,
} from './expressionEvaluator';
import { ExpressionType } from './expressionType';
import { Extensions } from './extensions';
import { FunctionTable } from './functionTable';
import { MemoryInterface, SimpleObjectMemory } from './memory';
import { Options } from './options';
import { ExpressionParser } from './parser';
import { ReturnType } from './returnType';

/**
 * An expression which can be analyzed or evaluated to produce a value.
 * This provides an open-ended wrapper that supports a number of built-in functions and can also be extended at runtime.
 * It also supports validation of the correctness of an expression and evaluation that should be exception free.
 */
export class Expression {
    /**
     * Expected result of evaluating the expression.
     *
     * @returns The expected result of evaluating the expression.
     */
    get returnType(): ReturnType {
        return this.evaluator.returnType;
    }

    /**
     * Type of expression.
     *
     * @returns The type of the expression.
     */
    get type(): string {
        return this.evaluator.type;
    }

    /**
     * Children expressions.
     */
    children: Expression[];

    /**
     * Evaluator of expression.
     */
    readonly evaluator: ExpressionEvaluator;

    /**
     * Dictionary of function => ExpressionEvaluator.
     * This is all available functions, you can add custom functions to it, but you cannot
     * replace builtin functions.  If you clear the dictionary, it will be reset to the built in functions.
     */
    static readonly functions: FunctionTable = new FunctionTable();

    /**
     * expression constructor.
     *
     * @param type Type of expression from ExpressionType
     * @param evaluator Information about how to validate and evaluate expression.
     * @param children Child expressions.
     */
    constructor(type: string, evaluator: ExpressionEvaluator, ...children: Expression[]) {
        if (evaluator) {
            this.evaluator = evaluator;
            this.children = children;
        } else if (type !== undefined) {
            if (!Expression.functions.get(type)) {
                throw Error(`${type} does not have an evaluator, it's not a built-in function or a custom function.`);
            }

            this.evaluator = Expression.functions.get(type);
            this.children = children;
        }
    }

    /**
     * Do a deep equality between expressions.
     *
     * @param other Other expression.
     * @returns True if expressions are the same.
     */
    deepEquals(other: Expression): boolean {
        let eq = false;
        if (other) {
            eq = this.type === other.type;
            if (eq) {
                eq = this.children.length === other.children.length;
                if (this.type === ExpressionType.And || this.type === ExpressionType.Or) {
                    // And/Or do not depand on order
                    for (let i = 0; eq && i < this.children.length; i++) {
                        const primary = this.children[0];
                        let found = false;
                        for (let j = 0; j < this.children.length; j++) {
                            if (primary.deepEquals(other.children[j])) {
                                found = true;
                                break;
                            }
                        }

                        eq = found;
                    }
                } else {
                    for (let i = 0; eq && i < this.children.length; i++) {
                        eq = this.children[i].deepEquals(other.children[i]);
                    }
                }
            }
        }
        return eq;
    }

    /**
     * Return the static reference paths to memory.
     * Return all static paths to memory.  If there is a computed element index, then the path is terminated there,
     * but you might get other paths from the computed part as well.
     *
     * @returns List of the static reference paths.
     */
    references(): string[] {
        const { path, refs } = this.referenceWalk(this);
        if (path !== undefined) {
            refs.add(path);
        }
        return Array.from(refs);
    }

    /**
     * Walking function for identifying static memory references in an expression.
     *
     * @param expression Expression to analyze.
     * @param extension If present, called to override lookup for things like template expansion.
     * @returns Accessor path of expression.
     */
    referenceWalk(
        expression: Expression,
        extension?: (arg0: Expression) => boolean
    ): { path: string; refs: Set<string> } {
        let path: string;
        let refs = new Set<string>();
        if (extension === undefined || !extension(expression)) {
            const children: Expression[] = expression.children;
            if (expression.type === ExpressionType.Accessor) {
                const prop: string = (children[0] as Constant).value as string;

                if (children.length === 1) {
                    path = prop;
                }

                if (children.length === 2) {
                    ({ path, refs } = this.referenceWalk(children[1], extension));
                    if (path !== undefined) {
                        path = path.concat('.', prop);
                    }
                    // if path is null we still keep it null, won't append prop
                    // because for example, first(items).x should not return x as refs
                }
            } else if (expression.type === ExpressionType.Element) {
                ({ path, refs } = this.referenceWalk(children[0], extension));
                if (path !== undefined) {
                    if (children[1] instanceof Constant) {
                        const cnst: Constant = children[1] as Constant;
                        if (cnst.returnType === ReturnType.String) {
                            path += `.${cnst.value}`;
                        } else {
                            path += `[${cnst.value}]`;
                        }
                    } else {
                        refs.add(path);
                    }
                }
                const result = this.referenceWalk(children[1], extension);
                const idxPath = result.path;
                const refs1 = result.refs;
                refs = new Set([...refs, ...refs1]);
                if (idxPath !== undefined) {
                    refs.add(idxPath);
                }
            } else if (
                expression.type === ExpressionType.Foreach ||
                expression.type === ExpressionType.Where ||
                expression.type === ExpressionType.Select
            ) {
                let result = this.referenceWalk(children[0], extension);
                const child0Path = result.path;
                const refs0 = result.refs;
                if (child0Path !== undefined) {
                    refs0.add(child0Path);
                }

                result = this.referenceWalk(children[2], extension);
                const child2Path = result.path;
                const refs2 = result.refs;
                if (child2Path !== undefined) {
                    refs2.add(child2Path);
                }

                const iteratorName = (children[1].children[0] as Constant).value as string;
                const nonLocalRefs2 = Array.from(refs2).filter(
                    (x): boolean =>
                        !(x === iteratorName || x.startsWith(iteratorName + '.') || x.startsWith(iteratorName + '['))
                );
                refs = new Set([...refs, ...refs0, ...nonLocalRefs2]);
            } else {
                for (const child of expression.children) {
                    const result = this.referenceWalk(child, extension);
                    const childPath = result.path;
                    const refs0 = result.refs;
                    refs = new Set([...refs, ...refs0]);
                    if (childPath !== undefined) {
                        refs.add(childPath);
                    }
                }
            }
        }

        return { path, refs };
    }

    /**
     * Parse an expression string into an [Expression](xref:adaptive-expressions.Expression) object.
     *
     * @param expression Expression string.
     * @param lookup Optional. [EvaluatorLookup](xref:adaptive-expressions.EvaluatorLookup) function lookup when parsing the expression. Default is [Expression.lookup](xref:adaptive-expressions.Expression.lookup) which uses [Expression.functions](xref:adaptive-expressions.Expression.functions) table.
     * @returns The expression object.
     */
    static parse(expression: string, lookup?: EvaluatorLookup): Expression {
        return new ExpressionParser(lookup || Expression.lookup).parse(expression.replace(/^=/, ''));
    }

    /**
     * Lookup an [ExpressionEvaluator](xref:adaptive-expressions.ExpressionEvaluator) function by name.
     *
     * @param functionName Name of function to lookup.
     * @returns An [ExpressionEvaluator](xref:adaptive-expressions.ExpressionEvaluator) corresponding to the function name.
     */
    static lookup(functionName: string): ExpressionEvaluator {
        const exprEvaluator = Expression.functions.get(functionName);
        if (!exprEvaluator) {
            return undefined;
        }

        return exprEvaluator;
    }

    /**
     * Make an expression and validate it.
     *
     * @param type Type of expression from ExpressionType.
     * @param evaluator Information about how to validate and evaluate expression.
     * @param children Child expressions.
     * @returns The new expression.
     */
    static makeExpression(type: string, evaluator: ExpressionEvaluator, ...children: Expression[]): Expression {
        const expr: Expression = new Expression(type, evaluator, ...children);
        expr.validate();

        return expr;
    }

    /**
     * Construct an expression from a EvaluateExpressionDelegate
     *
     * @param func Function to create an expression from.
     * @returns The new expression.
     */
    static lambaExpression(func: EvaluateExpressionDelegate): Expression {
        return new Expression(ExpressionType.Lambda, new ExpressionEvaluator(ExpressionType.Lambda, func));
    }

    /**
     * Construct an expression from a lamba expression over the state.
     * Exceptions will be caught and surfaced as an error string.
     *
     * @param func ambda expression to evaluate.
     * @returns New expression.
     */
    static lambda(func: (arg0: any) => any): Expression {
        return new Expression(
            ExpressionType.Lambda,
            new ExpressionEvaluator(
                ExpressionType.Lambda,
                (_expression: Expression, state: any, _: Options): ValueWithError => {
                    let value: any;
                    let error: string;
                    try {
                        value = func(state);
                    } catch (funcError) {
                        error = funcError;
                    }

                    return { value, error };
                }
            )
        );
    }

    /**
     * Construct and validate an Set a property expression to a value expression.
     *
     * @param property property expression.
     * @param value value expression.
     * @returns New expression.
     */
    static setPathToValue(property: Expression, value: any): Expression {
        if (value instanceof Expression) {
            return Expression.makeExpression(ExpressionType.SetPathToValue, undefined, property, value);
        } else {
            return Expression.makeExpression(ExpressionType.SetPathToValue, undefined, property, new Constant(value));
        }
    }

    /**
     * Construct and validate an Equals expression.
     *
     * @param children Child clauses.
     * @returns New expression.
     */
    static equalsExpression(...children: Expression[]): Expression {
        return Expression.makeExpression(ExpressionType.Equal, undefined, ...children);
    }

    /**
     * Construct and validate an And expression.
     *
     * @param children Child clauses.
     * @returns New expression.
     */
    static andExpression(...children: Expression[]): Expression {
        if (children.length > 1) {
            return Expression.makeExpression(ExpressionType.And, undefined, ...children);
        } else {
            return children[0];
        }
    }

    /**
     * Construct and validate an Or expression.
     *
     * @param children Child clauses.
     * @returns New expression.
     */
    static orExpression(...children: Expression[]): Expression {
        if (children.length > 1) {
            return Expression.makeExpression(ExpressionType.Or, undefined, ...children);
        } else {
            return children[0];
        }
    }

    /**
     * Construct and validate an Not expression.
     *
     * @param child Child clauses.
     * @returns New expression.
     */
    static notExpression(child: Expression): Expression {
        return Expression.makeExpression(ExpressionType.Not, undefined, child);
    }

    /**
     * Validate immediate expression.
     *
     * @returns The validated expression.
     */
    validate = (): void => this.evaluator.validateExpression(this);

    /**
     * Recursively validate the expression tree.
     */
    validateTree(): void {
        this.validate();
        for (const child of this.children) {
            child.validateTree();
        }
    }

    /**
     * Evaluate the expression.
     *
     * @param state Global state to evaluate accessor expressions against. Can be Dictionary, otherwise reflection is used to access property and then indexer.
     * @param options Options used in the evaluation.
     * @returns Computed value and an error string. If the string is non-null, then there was an evaluation error.
     */
    tryEvaluate(state: MemoryInterface | any, options: Options = undefined): ValueWithError {
        if (!Extensions.isMemoryInterface(state)) {
            state = SimpleObjectMemory.wrap(state);
        }

        options = options ? options : new Options();
        return this.evaluator.tryEvaluate(this, state, options);
    }

    /**
     * Returns a string that represents the current [Expression](xref:adaptive-expressions.Expression) object.
     *
     * @returns A string that represents the current [Expression](xref:adaptive-expressions.Expression) object.
     */
    toString(): string {
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
            const infix: boolean =
                this.type.length > 0 && !new RegExp(/[a-z]/i).test(this.type[0]) && this.children.length >= 2;
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
