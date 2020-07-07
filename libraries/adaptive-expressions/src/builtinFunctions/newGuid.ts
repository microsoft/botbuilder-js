import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class NewGuid extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.NewGuid, NewGuid.evaluator(), ReturnType.String, NewGuid.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((): string => FunctionUtils.newGuid());
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 0, 0);
    }
}