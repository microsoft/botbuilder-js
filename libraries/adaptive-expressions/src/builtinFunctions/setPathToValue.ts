import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';

export class SetPathToValue extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.SetPathToValue, SetPathToValue.evaluator, ReturnType.Object, FunctionUtils.validateBinary);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let path: string;
        let left: Expression;
        let error: string;
        ({path, left, error} = FunctionUtils.tryAccumulatePath(expression.children[0], state, options));
        if (error !== undefined) {
            return {value: undefined, error};
        }

        if (left) {
            // the expression can't be fully merged as a path
            return {value: undefined, error: `${expression.children[0].toString()} is not a valid path to set value`};
        }
        let value: any;
        let err: string;
        ({value, error: err} = expression.children[1].tryEvaluate(state, options));
        if (err) {
            return {value: undefined, error: err};
        }

        state.setValue(path, value);
        return {value, error: undefined};
    }
}