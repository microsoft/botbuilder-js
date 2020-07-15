/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { StringTransformEvaluator } from './stringTransformEvaluator';
import { FunctionUtils } from '../functionUtils';
import { ExpressionType } from '../expressionType';
import { Options } from '../options';

/**
 * Converts the specified string to sentence case.
 */
export class SentenceCase extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.SentenceCase, SentenceCase.evaluator);
    }

    private static evaluator(args: any[]): string {
        const inputStr = String(FunctionUtils.parseStringOrNull(args[0])).toLowerCase();
        if (inputStr === '') {
            return inputStr;
        } else {
            return inputStr.charAt(0).toUpperCase() + inputStr.substr(1).toLowerCase();
        }
    }
}