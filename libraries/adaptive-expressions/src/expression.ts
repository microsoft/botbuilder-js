/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionFunctions } from './expressionFunctions';
import { Constant } from './constant';
import { ExpressionEvaluator, EvaluateExpressionDelegate, EvaluatorLookup } from './expressionEvaluator';
import { ExpressionType } from './expressionType';
import { SimpleObjectMemory, MemoryInterface } from './memory';
import { Extensions } from './extensions';
import { ExpressionParser } from './parser';
import { Options } from './options';

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
     * FunctionTable is a dictionary which merges BuiltinFunctions.Functions with a CustomDictionary.
     */
    private static readonly FunctionTable = class implements Map<string, ExpressionEvaluator> {
        private readonly customFunctions = new Map<string, ExpressionEvaluator>();

        public keys(): IterableIterator<string> {
            const keysOfAllFunctions = Array.from(ExpressionFunctions.standardFunctions.keys()).concat(Array.from(this.customFunctions.keys()));
            return keysOfAllFunctions[Symbol.iterator]();
        }

        public values(): IterableIterator<ExpressionEvaluator> {
            const valuesOfAllFunctions = Array.from(ExpressionFunctions.standardFunctions.values()).concat(Array.from(this.customFunctions.values()));
            return valuesOfAllFunctions[Symbol.iterator]();
        }

        public get size(): number {
            return ExpressionFunctions.standardFunctions.size + this.customFunctions.size;
        }

        public get isReadOnly(): boolean { 
            return false;
        }

        public get(key: string): ExpressionEvaluator {

            if(ExpressionFunctions.standardFunctions.get(key)) {
                return ExpressionFunctions.standardFunctions.get(key);
            }

            if (this.customFunctions.get(key)) {
                return this.customFunctions.get(key);
            }

            return undefined;
        }

        public set(key: string, value: ExpressionEvaluator): this {
            if(ExpressionFunctions.standardFunctions.get(key)) {
                throw Error(`You can't overwrite a built in function.`);
            }

            this.customFunctions.set(key, value);
            return this;

        }

        public add(item: {key: string; value: ExpressionEvaluator} | string, value: ExpressionEvaluator|undefined): void{
            if(arguments.length === 1 && item instanceof Object) {
                this.set(item.key, item.value);
            } else if (arguments.length == 2 && typeof item === 'string') {
                this.set(item, value);
            }
        }

        public clear(): void {
            this.customFunctions.clear();
        }

        public has(key: string): boolean {
            return ExpressionFunctions.standardFunctions.has(key) || this.customFunctions.has(key);
        }

        public delete(key: string): boolean {
            return this.customFunctions.delete(key);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        public forEach(_callbackfn: (value: ExpressionEvaluator, key: string, map: Map<string, ExpressionEvaluator>) => void, thisArg?: any): void {
            throw Error(`forEach function not implemented`);
        }

        public entries(): IterableIterator<[string, ExpressionEvaluator]> {
            throw Error(`entries function not implemented`);
        }

        public get [Symbol.iterator](): () => IterableIterator<[string, ExpressionEvaluator]>  {
            throw Error(`Symbol.iterator function not implemented`);
        }

        public get [Symbol.toStringTag](): string {
            throw Error(`Symbol.toStringTag function not implemented`);
        }
    }
    /**
     * Dictionary of function => ExpressionEvaluator.
     * This is all available functions, you can add custom functions to it, but you cannot
     * replace builtin functions.  If you clear the dictionary, it will be reset to the built in functions.
     */
    public static readonly functions: Map<string, ExpressionEvaluator> = new Expression.FunctionTable();

    /**
     * expression constructor.
     * @param type Type of expression from ExpressionType
     * @param evaluator Information about how to validate and evaluate expression.
     * @param children Child expressions.
     */
    public constructor(type: string, evaluator: ExpressionEvaluator, ...children: Expression[]) {
        if(evaluator) {
            this.evaluator = evaluator;
            this.children = children;
        } else if(type !== undefined) {
            if (!Expression.functions.get(type)) {
                throw Error(`${ type } does not have an evaluator, it's not a built-in function or a custom function.`);
            }

            this.evaluator = Expression.functions.get(type);
            this.children = children;
        }
    }

    /**
     * Do a deep equality between expressions.
     * @param other Other expression.
     * @returns True if expressions are the same.
     */
    public deepEquals(other: Expression): boolean {
        let eq = false;
        if (!other) {
            eq = this.type === other.type;
            if (eq) {
                eq = this.children.length === other.children.length;
                if (this.type === ExpressionType.And || this.type === ExpressionType.Or) {
                    // And/Or do not depand on order
                    for(let i = 0; eq && i< this.children.length; i++) {
                        const primary = this.children[0];
                        let found = false;
                        for (var j = 0; j < this.children.length; j++) {
                            if (primary.deepEquals(other.children[j])) {
                                found = true;
                                break;
                            }
                        }

                        eq = found;
                    }
                } else {
                    for (let i = 0; eq && i< this.children.length; i++) {
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
     * @param expression Expression to get references from.
     * @returns List of the static reference paths.
     */
    public references(): string[] {
        const {path, refs} = this.referenceWalk(this);
        if (path !== undefined) {
            refs.add(path);
        }
        return Array.from(refs);
    }

    /**
     * Walking function for identifying static memory references in an expression.
     * @param expression Expression to analyze.
     * @param references Tracking for references found.
     * @param extension If present, called to override lookup for things like template expansion.
     * @returns Accessor path of expression.
     */
    public referenceWalk(expression: Expression,
        extension?: (arg0: Expression) => boolean): {path: string; refs: Set<string>} {
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
                    ({path, refs} = this.referenceWalk(children[1], extension));
                    if (path !== undefined) {
                        path = path.concat('.', prop);
                    }
                    // if path is null we still keep it null, won't append prop
                    // because for example, first(items).x should not return x as refs
                }
            } else if (expression.type === ExpressionType.Element) {
                ({path, refs}  = this.referenceWalk(children[0], extension));
                if (path !== undefined) {
                    if (children[1] instanceof Constant) {
                        const cnst: Constant = children[1] as Constant;
                        if (cnst.returnType === ReturnType.String) {
                            path += `.${ cnst.value }`;
                        } else {
                            path += `[${ cnst.value }]`;
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
            } else if (expression.type === ExpressionType.Foreach || 
                    expression.type === ExpressionType.Where ||
                    expression.type === ExpressionType.Select ) {
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
                var nonLocalRefs2 = Array.from(refs2).filter((x): boolean => !(x === iteratorName || x.startsWith(iteratorName + '.') || x.startsWith(iteratorName + '[')));
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

        return {path, refs};
    }

    public static parse(expression: string, lookup?: EvaluatorLookup): Expression {
        return new ExpressionParser(lookup || Expression.lookup).parse(expression);
    }

    /**
     * Lookup a ExpressionEvaluator (function) by name.
     * @param functionName name of function to lookup
     * @returns a ExpressionEvaluator that corresponding to the funtion name
     */
    public static lookup(functionName: string): ExpressionEvaluator {
        const exprEvaluator = Expression.functions.get(functionName);
        if (!exprEvaluator) {
            return undefined;
        }

        return exprEvaluator;
    };

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
            (_expression: Expression, state: any, _: Options): { value: any; error: string } => {
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
    public tryEvaluate(state: MemoryInterface | any, options: Options = undefined): { value: any; error: string } {
        if(!Extensions.isMemoryInterface(state)) {
            state = SimpleObjectMemory.wrap(state);
        }
        return this.evaluator.tryEvaluate(this, state, options);
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