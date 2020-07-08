import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class Select extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Select, FunctionUtils.foreach, ReturnType.Array, FunctionUtils.validateForeach);
    }
}