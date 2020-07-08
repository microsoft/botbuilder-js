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
import { Constant } from '../constant';
import { StackedMemory } from '../memory/stackedMemory';
import { SimpleObjectMemory } from '../memory/simpleObjectMemory';

/**
 * Filter on each element and return the new collection of filtered elements which match a specific condition.
 */
export class Where extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Where, Where.evaluator, ReturnType.Boolean, FunctionUtils.validateForeach);
    }

    public static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let result: any;
        let error: string;
        let instance: any;

        ({value: instance, error} = expression.children[0].tryEvaluate(state, options));

        if (!error) {
            const iteratorName = (expression.children[1].children[0] as Constant).value as string;
            let arr: any[] = [];
            let isInstanceArray = false;
            if (Array.isArray(instance)) {
                arr = instance;
                isInstanceArray = true;
            } else if (typeof instance === 'object') {
                Object.keys(instance).forEach((u): number => arr.push({key: u, value: instance[u]}));
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
                    const {value: r, error: e} = expression.children[2].tryEvaluate(stackedMemory, newOptions);
                    stackedMemory.pop();
                    if (e !== undefined) {
                        return {value: undefined, error: e};
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

        return {value: result, error};
    }
}