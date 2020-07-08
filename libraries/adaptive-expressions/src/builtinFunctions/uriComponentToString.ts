import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class UriComponentToString extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.UriComponentToString, UriComponentToString.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): string => decodeURIComponent(args[0]), FunctionUtils.verifyString);
    }
}