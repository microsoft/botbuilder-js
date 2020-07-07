import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class Average extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Average, Average.evaluator(), ReturnType.Number, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): number => args[0].reduce((x: number, y: number): number => x + y) / args[0].length,
            FunctionUtils.verifyNumericList);
    }
}