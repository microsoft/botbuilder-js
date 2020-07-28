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
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { SimpleObjectMemory } from '../memory/simpleObjectMemory';
=======
import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { SimpleObjectMemory } from '../memory/simpleObjectMemory';
import { Options } from '../options';
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * Retrieve the value of the specified property from the JSON object.
 */
export class GetProperty extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.GetProperty, GetProperty.evaluator, ReturnType.Object, GetProperty.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
=======
    public constructor() {
        super(ExpressionType.GetProperty, GetProperty.evaluator, ReturnType.Object, GetProperty.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
>>>>>>> master
        let value: any;
        let error: string;
        let firstItem: any;
        let property: any;

        const children: Expression[] = expression.children;
<<<<<<< HEAD
        ({value: firstItem, error} = children[0].tryEvaluate(state, options));
=======
        ({ value: firstItem, error } = children[0].tryEvaluate(state, options));
>>>>>>> master
        if (!error) {
            if (children.length === 1) {
                // get root value from memory
                if (typeof firstItem === 'string') {
                    value = FunctionUtils.wrapGetValue(state, firstItem, options);
                } else {
<<<<<<< HEAD
                    error = `"Single parameter ${ children[0] } is not a string."`;
                }
            } else {
                // get the peoperty value from the instance
                ({value: property, error} = children[1].tryEvaluate(state, options));
=======
                    error = `"Single parameter ${children[0]} is not a string."`;
                }
            } else {
                // get the peoperty value from the instance
                ({ value: property, error } = children[1].tryEvaluate(state, options));
>>>>>>> master

                if (!error) {
                    value = FunctionUtils.wrapGetValue(new SimpleObjectMemory(firstItem), property.toString(), options);
                }
            }
        }

<<<<<<< HEAD
        return {value, error};
=======
        return { value, error };
>>>>>>> master
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Object);
    }
}