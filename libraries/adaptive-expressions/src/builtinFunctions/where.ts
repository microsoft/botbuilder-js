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
import { Constant } from '../constant';
import { StackedMemory } from '../memory/stackedMemory';
import { SimpleObjectMemory } from '../memory/simpleObjectMemory';
=======
import { Constant } from '../constant';
import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { SimpleObjectMemory } from '../memory/simpleObjectMemory';
import { StackedMemory } from '../memory/stackedMemory';
import { Options } from '../options';
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * Filter on each element and return the new collection of filtered elements which match a specific condition.
 */
export class Where extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.Where, Where.evaluator, ReturnType.Array, FunctionUtils.validateForeach);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
=======
    public constructor() {
        super(ExpressionType.Where, Where.evaluator, ReturnType.Array, FunctionUtils.validateForeach);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
>>>>>>> master
        let result: any;
        let error: string;
        let instance: any;

<<<<<<< HEAD
        ({value: instance, error} = expression.children[0].tryEvaluate(state, options));
=======
        ({ value: instance, error } = expression.children[0].tryEvaluate(state, options));
>>>>>>> master

        if (!error) {
            const iteratorName = (expression.children[1].children[0] as Constant).value as string;
            let arr: any[] = [];
            let isInstanceArray = false;
            if (Array.isArray(instance)) {
                arr = instance;
                isInstanceArray = true;
            } else if (typeof instance === 'object') {
<<<<<<< HEAD
                Object.keys(instance).forEach((u): number => arr.push({key: u, value: instance[u]}));
=======
                Object.keys(instance).forEach((u): number => arr.push({ key: u, value: instance[u] }));
>>>>>>> master
            } else {
                error = `${expression.children[0]} is not a collection or structure object to run foreach`;
            }

            if (!error) {
                const stackedMemory = StackedMemory.wrap(state);
                const arrResult = [];
                for (const item of arr) {
                    const local: Map<string, any> = new Map<string, any>([
                        [iteratorName, item]
                    ]);

                    stackedMemory.push(SimpleObjectMemory.wrap(local));
                    const newOptions = new Options(options);
                    newOptions.nullSubstitution = undefined;
<<<<<<< HEAD
                    const {value: r, error: e} = expression.children[2].tryEvaluate(stackedMemory, newOptions);
                    stackedMemory.pop();
                    if (e !== undefined) {
                        return {value: undefined, error: e};
=======
                    const { value: r, error: e } = expression.children[2].tryEvaluate(stackedMemory, newOptions);
                    stackedMemory.pop();
                    if (e !== undefined) {
                        return { value: undefined, error: e };
>>>>>>> master
                    }

                    if ((Boolean(r))) {
                        arrResult.push(local.get(iteratorName));
                    }
                }

                //reconstruct object if instance is object, otherwise, return array result
                if (!isInstanceArray) {
                    let objResult = {};
                    for (const item of arrResult) {
                        objResult[item.key] = item.value;
                    }

                    result = objResult;
                } else {
                    result = arrResult;
                }
            }
        }

<<<<<<< HEAD
        return {value: result, error};
=======
        return { value: result, error };
>>>>>>> master
    }
}