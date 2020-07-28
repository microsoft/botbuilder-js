/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { ExpressionEvaluator, EvaluateExpressionDelegate, ValidateExpressionDelegate } from '../expressionEvaluator';
import { VerifyExpression, FunctionUtils } from '../functionUtils';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
import { MemoryInterface, Options } from '..';
=======
import { MemoryInterface, Options } from '../';
import { Expression } from '../expression';
import {
    EvaluateExpressionDelegate, ExpressionEvaluator, ValidateExpressionDelegate, ValueWithError
} from '../expressionEvaluator';
import { FunctionUtils, VerifyExpression } from '../functionUtils';
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * Comparison operators.
 * A comparison operator returns false if the comparison is false, or there is an error.  This prevents errors from short-circuiting boolean expressions.
 */
export class ComparisonEvaluator extends ExpressionEvaluator {
    public constructor(type: string, func: (arg0: any[]) => boolean, validator: ValidateExpressionDelegate, verify?: VerifyExpression) {
        super(type, ComparisonEvaluator.evaluator(func, verify), ReturnType.Boolean, validator);
    }

    private static evaluator(func: (args: any[]) => boolean, verify?: VerifyExpression): EvaluateExpressionDelegate {
<<<<<<< HEAD
        return (expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} => {
=======
        return (expression: Expression, state: MemoryInterface, options: Options): ValueWithError => {
>>>>>>> master
            let result = false;
            let error: string;
            let args: any[];
            const newOptions = new Options(options);
            newOptions.nullSubstitution = undefined;
<<<<<<< HEAD
            ({args, error} = FunctionUtils.evaluateChildren(expression, state, newOptions, verify));
=======
            ({ args, error } = FunctionUtils.evaluateChildren(expression, state, newOptions, verify));
>>>>>>> master
            if (!error) {
                const isNumber: boolean = args && args.length > 0 && typeof args[0] === 'number';
                for (const arg of args) {
                    if (arg && (typeof arg === 'number') !== isNumber) {
                        error = `Arguments must either all be numbers or strings in ${expression}`;
                        break;
                    }
                }

                if (!error) {
                    try {
                        result = func(args);
                    } catch (e) {
                        // NOTE: This should not happen in normal execution
                        error = e.message;
                    }
                }
            } else {
                error = undefined;
            }

<<<<<<< HEAD
            return {value: result, error};
=======
            return { value: result, error };
>>>>>>> master
        };
    }
}