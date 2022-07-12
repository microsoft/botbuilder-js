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
import { SimpleObjectMemory } from '../memory/simpleObjectMemory';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Retrieve the value of the specified property from the JSON object.
 */
export class GetProperty extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [GetProperty](xref:adaptive-expressions.GetProperty) class.
     */
    constructor() {
        super(ExpressionType.GetProperty, GetProperty.evaluator, ReturnType.Object, GetProperty.validator);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let property: any;

        const children: Expression[] = expression.children;
        const { value: firstItem, error: childrenError } = children[0].tryEvaluate(state, options);
        let error = childrenError;
        if (!error) {
            if (children.length === 1) {
                // get root value from memory
                if (typeof firstItem === 'string') {
                    value = InternalFunctionUtils.wrapGetValue(state, firstItem, options);
                } else {
                    error = `"Single parameter ${children[0]} is not a string."`;
                }
            } else {
                // get the peoperty value from the instance
                ({ value: property, error } = children[1].tryEvaluate(state, options));

                if (!error) {
                    value = InternalFunctionUtils.wrapGetValue(
                        new SimpleObjectMemory(firstItem),
                        property.toString(),
                        options
                    );
                }
            }
        }

        return { value, error };
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Object);
    }
}
