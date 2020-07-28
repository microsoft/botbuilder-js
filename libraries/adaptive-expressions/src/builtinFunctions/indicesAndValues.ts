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
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { Options } from '../options';

/**
 * Turn an array or object into an array of objects with index (current index) and value properties.
=======
import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Turn an array or object into an array of objects with index and value properties.
>>>>>>> master
 * For arrays, the index is the position in the array.
 * For objects, it is the key for the value.
 */
export class IndicesAndValues extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.IndicesAndValues, IndicesAndValues.evaluator, ReturnType.Array, FunctionUtils.validateUnary);
    }

    private static evaluator(expression: Expression, state: any, options: Options): {value: any; error: string} {
        let result: object = undefined;
        let error: string = undefined;
        let value: any = undefined;
        ({value, error} = expression.children[0].tryEvaluate(state, options));
=======
    public constructor() {
        super(ExpressionType.IndicesAndValues, IndicesAndValues.evaluator, ReturnType.Array, FunctionUtils.validateUnary);
    }

    private static evaluator(expression: Expression, state: any, options: Options): ValueWithError {
        let result: object = undefined;
        let error: string = undefined;
        let value: any = undefined;
        ({ value, error } = expression.children[0].tryEvaluate(state, options));
>>>>>>> master
        if (error === undefined) {
            if (Array.isArray(value)) {
                const tempList = [];
                for (let i = 0; i < value.length; i++) {
<<<<<<< HEAD
                    tempList.push({index: i, value: value[i]});
=======
                    tempList.push({ index: i, value: value[i] });
>>>>>>> master
                }

                result = tempList;
            } else if (typeof value === 'object') {
                const tempList = [];
                for (let [index, val] of Object.entries(value)) {
<<<<<<< HEAD
                    tempList.push({index: index, value: val});
=======
                    tempList.push({ index: index, value: val });
>>>>>>> master
                }

                result = tempList;
            } else {
                error = `${expression.children[0]} is not array or object.`;
            }
        }

<<<<<<< HEAD
        return {value: result, error};
=======
        return { value: result, error };
>>>>>>> master
    }
}