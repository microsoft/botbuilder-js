/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { ExpressionEvaluator } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
=======
import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
>>>>>>> master
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
<<<<<<< HEAD

/**
 * Return a number of ticks that the two timestamp differs.
 */
export class DateTimeDiff extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.DateTimeDiff, DateTimeDiff.evaluator, ReturnType.Number, DateTimeDiff.validator);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
=======
import { ReturnType } from '../returnType';

/**
 * Return a number of ticks that the two timestamps differ.
 */
export class DateTimeDiff extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.DateTimeDiff, DateTimeDiff.evaluator, ReturnType.Number, DateTimeDiff.validator);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): ValueWithError {
>>>>>>> master
        let value: any;
        let dateTimeStart: any;
        let dateTimeEnd: any;
        let error: string;
        let args: any[];
<<<<<<< HEAD
        ({args, error} = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            ({value: dateTimeStart, error: error} = FunctionUtils.ticks(args[0]));
            if (!error) {
                ({value: dateTimeEnd, error: error} = FunctionUtils.ticks(args[1]));
=======
        ({ args, error } = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            ({ value: dateTimeStart, error: error } = FunctionUtils.ticks(args[0]));
            if (!error) {
                ({ value: dateTimeEnd, error: error } = FunctionUtils.ticks(args[1]));
>>>>>>> master
            }
        }

        if (!error) {
            value = dateTimeStart - dateTimeEnd;
        }

<<<<<<< HEAD
        return {value, error};
=======
        return { value, error };
>>>>>>> master
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2, ReturnType.String);
    }
}