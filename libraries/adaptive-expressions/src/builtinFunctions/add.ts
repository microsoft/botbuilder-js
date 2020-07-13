/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

/**
 * Return the result from adding two or more numbers (pure number case) or concatting two or more strings (other case).
 */
export class Add extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Add, Add.evaluator(), ReturnType.String | ReturnType.Number, Add.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applySequenceWithError(
            (args: any[]): any => {
                let value: any;
                let error: string;
                const stringConcat = !FunctionUtils.isNumber(args[0]) || !FunctionUtils.isNumber(args[1]);
                if (((args[0] === null || args[0] === undefined) && FunctionUtils.isNumber(args[1]))
                    || ((args[1] === null || args[1] === undefined) && FunctionUtils.isNumber(args[0]))) {
                    error = 'Operator \'+\' or add cannot be applied to operands of type \'number\' and null object.';
                }
                else if (stringConcat) {
                    if ((args[0] === null || args[0] === undefined) && (args[1] === null || args[1] === undefined)) {
                        value = '';
                    } else if (args[0] === null || args[0] === undefined) {
                        value = args[1].toString();
                    } else if (args[1] === null || args[1] === undefined) {
                        value = args[0].toString();
                    } else {
                        value = args[0].toString() + args[1].toString();
                    }
                } else {
                    value = args[0] + args[1];
                }

                return {value, error};
            }, FunctionUtils.verifyNumberOrStringOrNull);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, Number.MAX_SAFE_INTEGER, ReturnType.String | ReturnType.Number);
    }
}