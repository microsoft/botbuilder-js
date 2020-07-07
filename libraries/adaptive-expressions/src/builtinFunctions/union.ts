import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class Union extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Union, Union.evaluator(), ReturnType.Array, Union.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): any => {
                let result: any[] = [];
                for (const arg of args) {
                    result = result.concat(arg);
                }

                return Array.from(new Set(result));
            },
            FunctionUtils.verifyList);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.Array);
    }
}