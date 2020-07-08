/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class AddOrdinal extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.AddOrdinal, AddOrdinal.evaluator(), ReturnType.String, AddOrdinal.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): string => AddOrdinal.evalAddOrdinal(args[0]), FunctionUtils.verifyInteger);
    }

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

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 1, ReturnType.Number);
    }
}