import { ExpressionEvaluator } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { SimpleObjectMemory } from '../memory/simpleObjectMemory';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { Constant } from '../constant';

export class Accessor extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Accessor, Accessor.evaluator, ReturnType.Object, Accessor.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let path: string;
        let left: Expression;
        let error: string;
        ({path, left, error} = FunctionUtils.tryAccumulatePath(expression, state, options));
        if (error) {
            return {value: undefined, error};
        }

        if (left == undefined) {
            // fully converted to path, so we just delegate to memory scope
            return {value: FunctionUtils.wrapGetValue(state, path, options), error: undefined};
        } else {
            let newScope: any;
            let err: string;
            ({value: newScope, error: err} = left.tryEvaluate(state, options));
            if (err) {
                return {value: undefined, error: err};
            }

            return {value: FunctionUtils.wrapGetValue(new SimpleObjectMemory(newScope), path, options), error: undefined};
        }
    }

    private static validator(expression: Expression): void {
        const children: Expression[] = expression.children;
        if (children.length === 0
            || !(children[0] instanceof Constant)
            || (children[0] as Constant).returnType !== ReturnType.String) {
            throw new Error(`${expression} must have a string as first argument.`);
        }

        if (children.length > 2) {
            throw new Error(`${expression} has more than 2 children.`);
        }
        if (children.length === 2 && (children[1].returnType & ReturnType.Object) === 0) {
            throw new Error(`${expression} must have an object as its second argument.`);
        }
    }
}