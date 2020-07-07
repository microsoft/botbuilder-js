import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';

export class Or extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Or, Or.evaluator, ReturnType.Boolean, FunctionUtils.validateAtLeastOne);
    }

    public static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let result = false;
        let error: string;
        for (const child of expression.children) {
            const newOptions = new Options(options);
            newOptions.nullSubstitution = undefined;
            ({value: result, error} = child.tryEvaluate(state, newOptions));
            if (!error) {
                if (FunctionUtils.isLogicTrue(result)) {
                    result = true;
                    break;
                }
            } else {
                error = undefined;
            }
        }

        return {value: result, error};
    }
}