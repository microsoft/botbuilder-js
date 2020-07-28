/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
=======
import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * Format number into required decimal numbers.
 */
export class FormatNumber extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
=======
    public constructor() {
>>>>>>> master
        super(ExpressionType.FormatNumber, FormatNumber.evaluator(), ReturnType.String, FormatNumber.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let value: any = null;
                let error: string;
                let number = args[0];
                let precision = args[1];
                let locale = args.length > 2 ? args[2] : 'en-us';
                if (typeof number !== 'number') {
                    error = `formatNumber first argument ${number} must be a number`;
                } else if (typeof precision !== 'number') {
                    error = `formatNumber second argument ${precision} must be a number`;
                } else if (locale && typeof locale !== 'string') {
                    error = `formatNubmer third argument ${locale} is not a valid locale`;
                } else {
                    // NOTE: Nodes toLocaleString and Intl do not work to localize unless a special version of node is used.
                    // TODO: In R10 we should try another package.  Numeral and d3-format have the basics, but no locale specific.  
                    // Numbro has locales, but is optimized for the browser.
<<<<<<< HEAD
                    value = number.toLocaleString(locale, {minimumFractionDigits: precision, maximumFractionDigits: precision});
                }

                return {value, error};
=======
                    value = number.toLocaleString(locale, { minimumFractionDigits: precision, maximumFractionDigits: precision });
                }

                return { value, error };
>>>>>>> master
            });
    }

    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, [ReturnType.String], ReturnType.Number, ReturnType.Number);
    }
}