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
 * Retrieve the value of the specified property from the JSON object.
 */
export class SetPathToValue extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.SetPathToValue, SetPathToValue.evaluator, ReturnType.Object, FunctionUtils.validateBinary);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let path: string;
        let left: Expression;
        let error: string;
        ({path, left, error} = FunctionUtils.tryAccumulatePath(expression.children[0], state, options));
        if (error !== undefined) {
            return {value: undefined, error};
=======
import { ReturnType } from '../returnType';

/**
 * Set path in a JSON object to value.
 */
export class SetPathToValue extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.SetPathToValue, SetPathToValue.evaluator, ReturnType.Object, FunctionUtils.validateBinary);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let path: string;
        let left: Expression;
        let error: string;
        ({ path, left, error } = FunctionUtils.tryAccumulatePath(expression.children[0], state, options));
        if (error !== undefined) {
            return { value: undefined, error };
>>>>>>> master
        }

        if (left) {
            // the expression can't be fully merged as a path
<<<<<<< HEAD
            return {value: undefined, error: `${expression.children[0].toString()} is not a valid path to set value`};
        }
        let value: any;
        let err: string;
        ({value, error: err} = expression.children[1].tryEvaluate(state, options));
        if (err) {
            return {value: undefined, error: err};
        }

        state.setValue(path, value);
        return {value, error: undefined};
=======
            return { value: undefined, error: `${expression.children[0].toString()} is not a valid path to set value` };
        }
        let value: any;
        let err: string;
        ({ value, error: err } = expression.children[1].tryEvaluate(state, options));
        if (err) {
            return { value: undefined, error: err };
        }

        state.setValue(path, value);
        return { value, error: undefined };
>>>>>>> master
    }
}