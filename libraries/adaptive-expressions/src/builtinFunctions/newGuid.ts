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
 * Return a new Guid string.
 */
export class NewGuid extends ExpressionEvaluator {

    /**
     * Initializes a new instance of the NewGuid class.
     */
    public constructor() {
        super(ExpressionType.NewGuid, NewGuid.evaluator(), ReturnType.String, NewGuid.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((): string => NewGuid.evalNewGuid());
    }

    /**
     * @private
     */
    private static evalNewGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: any): string => {
            const r: number = Math.random() * 16 | 0;
            const v: number = c === 'x' ? r : (r & 0x3 | 0x8);

            return v.toString(16);
        });
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 0, 0);
    }
}
