/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import moment from 'moment';

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return a timestamp in the specified format from UNIX time (also know as Epoch time, POSIX time, UNIX Epoch time).
 */
export class FormatEpoch extends ExpressionEvaluator {

    /**
     * Initializes a new instance of the FormatEpoch class.
     */
    public constructor() {
        super(ExpressionType.FormatEpoch, FormatEpoch.evaluator(), ReturnType.String, FormatEpoch.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let error: string;
                let arg: any = args[0];
                if (typeof arg !== 'number') {
                    error = `formatEpoch first argument ${ arg } must be a number`;
                } else {
                    // Convert to ms
                    arg = arg * 1000;
                }

                let value: any;
                if (!error) {
                    const dateString: string = new Date(arg).toISOString();
                    value = args.length === 2 ? moment(dateString).format(FunctionUtils.timestampFormatter(args[1])) : dateString;
                }

                return { value, error };
            });
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Number);
    }
}
