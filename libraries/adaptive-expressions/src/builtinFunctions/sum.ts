import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class Sum extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Sum, Sum.evaluator(), ReturnType.Number, Sum.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): number => args[0].reduce((x: number, y: number): number => x + y),
            FunctionUtils.verifyNumericList);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [], ReturnType.Array);
    }
}