/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { SimpleObjectMemory } from '../memory/simpleObjectMemory';

export class GetProperty extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.GetProperty, GetProperty.evaluator, ReturnType.Object, GetProperty.validator);
    }

    public static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let firstItem: any;
        let property: any;

        const children: Expression[] = expression.children;
        ({value: firstItem, error} = children[0].tryEvaluate(state, options));
        if (!error) {
            if (children.length === 1) {
                // get root value from memory
                if (typeof firstItem === 'string') {
                    value = FunctionUtils.wrapGetValue(state, firstItem, options);
                } else {
                    error = `"Single parameter ${ children[0] } is not a string."`;
                }
            } else {
                // get the peoperty value from the instance
                ({value: property, error} = children[1].tryEvaluate(state, options));

                if (!error) {
                    value = FunctionUtils.wrapGetValue(new SimpleObjectMemory(firstItem), property.toString(), options);
                }
            }
        }

        return {value, error};
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Object);
    }
}