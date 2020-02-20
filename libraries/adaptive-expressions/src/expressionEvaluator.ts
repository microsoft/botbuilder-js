/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Expression, ReturnType } from './expression';
import { MemoryInterface } from './memory';

/**
 * Delegate for doing static validation on an expression.
 * Validators can and should throw exceptions if the expression is not valid.
 */
export type ValidateExpressionDelegate = (expression: Expression) => any;

/**
 * Delegate to evaluate an expression.
 * Evaluators should verify runtime arguments when appropriate and return an error rather than throw exceptions if possible.
 */
export type EvaluateExpressionDelegate = (expression: Expression, state: MemoryInterface) => { value: any; error: string };

/**
 * Delegate to lookup function information from the type.
 */
export type EvaluatorLookup = (type: string) => ExpressionEvaluator;

/**
 * Information on how to evaluate an expression.
 */
export class ExpressionEvaluator {

    /**
     * Gets the expression type for evaluator.
     */
    public type: string;
    /**
     * Type expected by evaluating the expression.
     */
    public returnType: ReturnType;
    private readonly _validator: ValidateExpressionDelegate;
    private readonly _evaluator: EvaluateExpressionDelegate;

    /**
     * Initializes a new instance of the <see cref="ExpressionEvaluator"/> class.
     * @param type Expression type.
     * @param evaluator Delegate to evaluate an expression.
     * @param returnType Type expected from evaluation.
     * @param validator Static validation of expression.
     */
    public constructor(
        type: string,
        evaluator: EvaluateExpressionDelegate,
        returnType: ReturnType = ReturnType.Object,
        validator?: ValidateExpressionDelegate) {
        this.type = type;
        this._evaluator = evaluator;
        this.returnType = returnType;
        // tslint:disable-next-line: no-empty
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._validator = validator === undefined ? ((expr: Expression): any => { }) : validator;
    }

    /**
     * Evaluate an expression.
     * @param expression Expression to evaluate.
     * @param state Global state information.
     */
    public tryEvaluate = (expression: Expression, state: MemoryInterface): { value: any; error: string } => this._evaluator(expression, state);
    /**
     * Validate an expression.
     * @param expression Expression to validate.
     */
    // tslint:disable-next-line: informative-docs
    public validateExpression = (expression: Expression): void => this._validator(expression);
}
