/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Turn an array or object into an array of objects with index and value properties.
 * For arrays, the index is the position in the array.
 * For objects, it is the key for the value.
 */
export class IndicesAndValues extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [IndicesAndValues](xref:adaptive-expressions.IndicesAndValues) class.
     */
    constructor() {
        super(
            ExpressionType.IndicesAndValues,
            IndicesAndValues.evaluator,
            ReturnType.Array,
            FunctionUtils.validateUnary
        );
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: any, options: Options): ValueWithError {
        // eslint-disable-next-line @typescript-eslint/ban-types
        let result: object = undefined;
        let error: string = undefined;
        let value: any = undefined;
        ({ value, error } = expression.children[0].tryEvaluate(state, options));
        if (error === undefined) {
            if (Array.isArray(value)) {
                const tempList = [];
                for (let i = 0; i < value.length; i++) {
                    tempList.push({ index: i, value: value[i] });
                }

                result = tempList;
            } else if (typeof value === 'object') {
                const tempList = [];
                for (const [index, val] of Object.entries(value)) {
                    tempList.push({ index: index, value: val });
                }

                result = tempList;
            } else {
                error = `${expression.children[0]} is not array or object.`;
            }
        }

        return { value: result, error };
    }
}
