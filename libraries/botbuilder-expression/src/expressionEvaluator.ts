
/**
 * @module botbuilder-expression
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Expression, ReturnType } from './expression';

/**
 * Delegate for doing static validation on an expression.
 */
export type ValidateExpressionDelegate = (expression: Expression) => any;

/**
 * Delegate to evaluate an expression.
 */
export type EvaluateExpressionDelegate = (expression: Expression, state: any) => { value: any; error: string };

/**
 * Delegate to lookup function information from the type.
 */
export type EvaluatorLookup = (type: string) => ExpressionEvaluator;

/**
 * Information on how to evaluate an expression.
 */
export class ExpressionEvaluator {

    /**
     * Type expected by evaluating the expression.
     */
    public ReturnType: ReturnType;
    private readonly _validator: ValidateExpressionDelegate;
    private readonly _evaluator: EvaluateExpressionDelegate;

    /**
     * Constructor for expression information.
     * @param evaluator Delegate to evaluate an expression.
     * @param returnType Type expected from evaluation.
     * @param validator Static validation of expression.
     */
    public constructor(evaluator: EvaluateExpressionDelegate,
                       returnType: ReturnType = ReturnType.Object,
                       validator?: ValidateExpressionDelegate) {
        this._evaluator = evaluator;
        this.ReturnType = returnType;
        this._validator = validator === undefined ? ((expr: Expression): any => { }) : validator;
    }

    /**
     * Evaluate an expression.
     * @param expression Expression to evaluate.
     * @param state Global state information.
     */
    public TryEvaluate = (expression: Expression, state: any): { value: any; error: string } => this._evaluator(expression, state);
    /**
     * Validate an expression.
     * @param expression Expression to validate.
     */
    // tslint:disable-next-line: informative-docs
    public ValidateExpression = (expression: Expression): void  => this._validator(expression);
}
