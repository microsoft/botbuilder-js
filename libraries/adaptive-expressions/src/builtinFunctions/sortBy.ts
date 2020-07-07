import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class SortBy extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.SortBy, FunctionUtils.sortBy(false), ReturnType.Array, SortBy.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((): string => FunctionUtils.newGuid());
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Array);
    }
}