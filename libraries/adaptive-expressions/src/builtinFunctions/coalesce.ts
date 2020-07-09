/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

/**
 * Return the first non-null value from one or more parameters.
 * Empty strings, empty arrays, and empty objects are not null.
 */
export class Coalesce extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Coalesce, Coalesce.evaluator(), ReturnType.Object, FunctionUtils.validateAtLeastOne);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[][]): any => Coalesce.evalCoalesce(args as any[]));
    }

    private static evalCoalesce(objetcList: object[]): any {
        for (const obj of objetcList) {
            if (obj !== null && obj !== undefined) {
                return obj;
            }
        }

        return undefined;
    }
}