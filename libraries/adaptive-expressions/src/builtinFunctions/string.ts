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
 * Return the string version of a value.
 */
export class String extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.String, String.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): string => {
            if (typeof args[0] === 'string') {
                return args[0];
            }

            return JSON.stringify(args[0])
                .replace(/(^\'*)/g, '')
                .replace(/(\'*$)/g, '')
                .replace(/(^\"*)/g, '')
                .replace(/(\"*$)/g, '');
        });
    }
}