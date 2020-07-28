/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { StringTransformEvaluator } from './stringTransformEvaluator';
import { FunctionUtils } from '../functionUtils';
import { ExpressionType } from '../expressionType';

/**
 * Converts the specified string to sentence case.
=======
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { StringTransformEvaluator } from './stringTransformEvaluator';

/**
 * Capitalizing only the first word and leave others lowercase.
>>>>>>> master
 */
export class SentenceCase extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.SentenceCase, SentenceCase.evaluator);
    }

    private static evaluator(args: any[]): string {
<<<<<<< HEAD
        const inputStr = String(FunctionUtils.parseStringOrNull(args[0])).toLowerCase();
=======
        const inputStr = String(FunctionUtils.parseStringOrUndefined(args[0])).toLowerCase();
>>>>>>> master
        if (inputStr === '') {
            return inputStr;
        } else {
            return inputStr.charAt(0).toUpperCase() + inputStr.substr(1).toLowerCase();
        }
    }
}