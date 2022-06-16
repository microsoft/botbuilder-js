/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return the ordinal number of the input number.
 */
export class AddOrdinal extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [AddOrdinal](xref:adaptive-expressions.AddOrdinal) class.
     */
    constructor() {
        super(ExpressionType.AddOrdinal, AddOrdinal.evaluator(), ReturnType.String, AddOrdinal.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): string => AddOrdinal.evalAddOrdinal(args[0]),
            FunctionUtils.verifyInteger
        );
    }

    /**
     * @private
     */
    private static evalAddOrdinal(num: number): string {
        let hasResult = false;
        let ordinalResult: string = num.toString();
        if (num > 0) {
            switch (num % 100) {
                case 11:
                case 12:
                case 13:
                    ordinalResult += 'th';
                    hasResult = true;
                    break;
                default:
                    break;
            }

            if (!hasResult) {
                switch (num % 10) {
                    case 1:
                        ordinalResult += 'st';
                        break;
                    case 2:
                        ordinalResult += 'nd';
                        break;
                    case 3:
                        ordinalResult += 'rd';
                        break;
                    default:
                        ordinalResult += 'th';
                        break;
                }
            }
        }

        return ordinalResult;
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 1, ReturnType.Number);
    }
}
