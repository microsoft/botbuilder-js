import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class NewGuid extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.NewGuid, NewGuid.evaluator(), ReturnType.Array, NewGuid.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): string[] => FunctionUtils.parseStringOrNull(args[0]).split(FunctionUtils.parseStringOrNull(args[1] || '')), FunctionUtils.verifyStringOrNull);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 2, ReturnType.String);
    }
}