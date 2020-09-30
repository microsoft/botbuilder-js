/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import bigInt from 'big-integer';
import moment from 'moment';

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';

/**
 * Return a timestamp in the specified format from ticks.
 */
export class FormatTicks extends ExpressionEvaluator {

    /**
     * Initializes a new instance of the FormatTicks class.
     */
    public constructor() {
        super(ExpressionType.FormatTicks, FormatTicks.evaluator(), ReturnType.String, FormatTicks.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let error: string;
                let arg: any = args[0];
                if (typeof arg === 'number') {
                    arg = bigInt(arg);
                }
                if (typeof arg === 'string') {
                    arg = bigInt(arg);
                }
                if (!bigInt.isInstance(arg)) {
                    error = `formatTicks first argument ${ arg } is not a number, numeric string or bigInt`;
                } else {
                    // Convert to ms
                    arg = ((arg.subtract(InternalFunctionUtils.UnixMilliSecondToTicksConstant)).divide(InternalFunctionUtils.MillisecondToTickConstant)).toJSNumber();
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
