import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class IsFloat extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.IsFloat, IsFloat.evaluator(), ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): boolean => this.isNumber(args[0]) && !Number.isInteger(args[0]));
    }
}