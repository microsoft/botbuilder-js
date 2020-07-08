import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class Base64ToString extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Base64ToString, Base64ToString.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: Readonly<any>): string => Buffer.from(args[0], 'base64').toString(), FunctionUtils.verifyString);
    }
}