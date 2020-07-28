/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

/**
 * Convert the string version of a floating-point number to a floating-point number. You can use this function only when passing custom parameters to an app, such as a logic app.
 */
export class Float extends ExpressionEvaluator {
    public constructor(){
=======
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Convert the string version of a floating-point number to a floating-point number.
 */
export class Float extends ExpressionEvaluator {
    public constructor() {
>>>>>>> master
        super(ExpressionType.Float, Float.evaluator(), ReturnType.Number, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let error: string;
                const value: number = parseFloat(args[0]);
                if (!FunctionUtils.isNumber(value)) {
                    error = `parameter ${args[0]} is not a valid number string.`;
                }

<<<<<<< HEAD
                return {value, error};
=======
                return { value, error };
>>>>>>> master
            });
    }
}