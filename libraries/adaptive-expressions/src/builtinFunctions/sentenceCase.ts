/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { StringTransformEvaluator } from './stringTransformEvaluator';

/**
 * Capitalizing only the first word and leave others lowercase.
 */
export class SentenceCase extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.SentenceCase, SentenceCase.evaluator);
    }

    private static evaluator(args: any[]): string {
        const inputStr = String(InternalFunctionUtils.parseStringOrUndefined(args[0])).toLowerCase();
        if (inputStr === '') {
            return inputStr;
        } else {
            return inputStr.charAt(0).toUpperCase() + inputStr.substr(1).toLowerCase();
        }
    }
}
