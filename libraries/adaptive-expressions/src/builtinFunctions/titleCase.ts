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
=======
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { StringTransformEvaluator } from './stringTransformEvaluator';
>>>>>>> master

/**
 * Converts the specified string to title case.
 */
export class TitleCase extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.TitleCase, TitleCase.evaluator);
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
            return inputStr.replace(/\w\S*/g, (txt): string => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        }
    }
}