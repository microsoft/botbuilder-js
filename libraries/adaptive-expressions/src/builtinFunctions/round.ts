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
=======
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * Rounds a number value to the nearest integer.
 */
export class Round extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
=======
    public constructor() {
>>>>>>> master
        super(ExpressionType.Round, Round.evaluator(), ReturnType.Number, FunctionUtils.validateUnaryOrBinaryNumber);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let result: any;
                let error: string;
                if (args.length === 2 && !Number.isInteger(args[1])) {
<<<<<<< HEAD
                    error = `The second parameter ${ args[1] } must be an integer.`;
=======
                    error = `The second parameter ${args[1]} must be an integer.`;
>>>>>>> master
                }

                if (!error) {
                    const digits = args.length === 2 ? args[1] as number : 0;
                    if (digits < 0 || digits > 15) {
<<<<<<< HEAD
                        error = `The second parameter ${ args[1] } must be an integer between 0 and 15;`;
=======
                        error = `The second parameter ${args[1]} must be an integer between 0 and 15;`;
>>>>>>> master
                    } else {
                        result = Round.roundToPrecision(args[0], digits);
                    }
                }

<<<<<<< HEAD
                return {value: result, error};
=======
                return { value: result, error };
>>>>>>> master
            },
            FunctionUtils.verifyNumber
        );
    }

    private static roundToPrecision = (num: number, digits: number): number => Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
}