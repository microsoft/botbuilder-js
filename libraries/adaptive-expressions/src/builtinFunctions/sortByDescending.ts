import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class SortByDescending extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.NewGuid, FunctionUtils.sortBy(true), ReturnType.Array, SortByDescending.validator);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Array);
    }
}