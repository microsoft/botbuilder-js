import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class NewGuid extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.NewGuid, NewGuid.evaluator(), ReturnType.Array, NewGuid.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): any => {
                let result: any[] = args[0];
                for (const arg of args) {
                    result = result.filter((e: any): boolean => arg.indexOf(e) > -1);
                }

                return Array.from(new Set(result));
            },
            FunctionUtils.verifyList);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.Array);
    }
}