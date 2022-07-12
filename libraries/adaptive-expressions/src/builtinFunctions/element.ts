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
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * The indexing operator ([ ]) selects a single element from a sequence.
 * Support number index for list or string index for object.
 */
export class Element extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Element](xref:adaptive-expressions.Element) class.
     */
    constructor() {
        super(ExpressionType.Element, Element.evaluator, ReturnType.Object, FunctionUtils.validateBinary);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        const instance: Expression = expression.children[0];
        const index: Expression = expression.children[1];
        const { value: inst, error: evalError } = instance.tryEvaluate(state, options);
        let error = evalError;
        if (!error) {
            let idxValue: any;
            const newOptions = new Options(options);
            newOptions.nullSubstitution = undefined;
            ({ value: idxValue, error } = index.tryEvaluate(state, newOptions));
            if (!error) {
                if (Number.isInteger(idxValue)) {
                    ({ value, error } = InternalFunctionUtils.accessIndex(inst, Number(idxValue)));
                } else if (typeof idxValue === 'string') {
                    ({ value, error } = InternalFunctionUtils.accessProperty(inst, idxValue.toString()));
                } else {
                    error = `Could not coerce ${index} to an int or string.`;
                }

                return { value, error };
            }
        }
    }
}
