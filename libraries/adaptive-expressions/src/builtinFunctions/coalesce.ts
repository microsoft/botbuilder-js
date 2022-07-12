/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return the first non-null value from one or more parameters.
 * Empty strings, empty arrays, and empty objects are not null.
 */
export class Coalesce extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Coalesce](xref:adaptive-expressions.Coalesce) class.
     */
    constructor() {
        super(ExpressionType.Coalesce, Coalesce.evaluator(), ReturnType.Object, FunctionUtils.validateAtLeastOne);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[][]): any => Coalesce.evalCoalesce(args as any[]));
    }

    /**
     * @private
     */
    private static evalCoalesce(objectList: any[]): any {
        for (const obj of objectList) {
            if (obj != null) {
                return obj;
            }
        }

        return undefined;
    }
}
