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
import moment from 'moment';

/**
 * Return a timestamp in the specified format.
 */
export class FormatDateTime extends ExpressionEvaluator {
    public constructor(){
=======
import moment from 'moment';

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return a timestamp in the specified format.
 * Format reference: https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
 */
export class FormatDateTime extends ExpressionEvaluator {
    public constructor() {
>>>>>>> master
        super(ExpressionType.FormatDateTime, FormatDateTime.evaluator(), ReturnType.String, FormatDateTime.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let error: string;
                let arg: any = args[0];
                if (typeof arg === 'string') {
                    error = FunctionUtils.verifyTimestamp(arg.toString());
                } else {
                    arg = arg.toString();
                }
                let value: any;
                if (!error) {
                    const dateString: string = new Date(arg).toISOString();
                    value = args.length === 2 ? moment(dateString).format(FunctionUtils.timestampFormatter(args[1])) : dateString;
                }

<<<<<<< HEAD
                return {value, error};
=======
                return { value, error };
>>>>>>> master
            });
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.String);
    }
}