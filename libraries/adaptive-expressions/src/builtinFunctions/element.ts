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
=======
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * The indexing operator ([ ]) selects a single element from a sequence.
 * Support number index for list or string index for object.
 */
export class Element extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.Element, Element.evaluator, ReturnType.Object, FunctionUtils.validateBinary);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
=======
    public constructor() {
        super(ExpressionType.Element, Element.evaluator, ReturnType.Object, FunctionUtils.validateBinary);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
>>>>>>> master
        let value: any;
        let error: string;
        const instance: Expression = expression.children[0];
        const index: Expression = expression.children[1];
        let inst: any;
<<<<<<< HEAD
        ({value: inst, error} = instance.tryEvaluate(state, options));
=======
        ({ value: inst, error } = instance.tryEvaluate(state, options));
>>>>>>> master
        if (!error) {
            let idxValue: any;
            const newOptions = new Options(options);
            newOptions.nullSubstitution = undefined;
<<<<<<< HEAD
            ({value: idxValue, error} = index.tryEvaluate(state, newOptions));
            if (!error) {
                if (Number.isInteger(idxValue)) {
                    ({value, error} = FunctionUtils.accessIndex(inst, Number(idxValue)));
                } else if (typeof idxValue === 'string') {
                    ({value, error} = FunctionUtils.accessProperty(inst, idxValue.toString()));
=======
            ({ value: idxValue, error } = index.tryEvaluate(state, newOptions));
            if (!error) {
                if (Number.isInteger(idxValue)) {
                    ({ value, error } = FunctionUtils.accessIndex(inst, Number(idxValue)));
                } else if (typeof idxValue === 'string') {
                    ({ value, error } = FunctionUtils.accessProperty(inst, idxValue.toString()));
>>>>>>> master
                } else {
                    error = `Could not coerce ${index} to an int or string.`;
                }

<<<<<<< HEAD
                return {value, error};
=======
                return { value, error };
>>>>>>> master
            }
        }
    }
}