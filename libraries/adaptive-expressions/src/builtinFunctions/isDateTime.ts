import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class IsDateTime extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.IsDateTime, IsDateTime.evaluator(), ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): boolean => typeof args[0] === 'string' && FunctionUtils.verifyISOTimestamp(args[0]) === undefined);
    }
}