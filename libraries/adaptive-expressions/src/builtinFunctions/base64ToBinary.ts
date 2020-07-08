import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class Base64ToBinary extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Base64ToBinary, Base64ToBinary.evaluator(), ReturnType.Object, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: Readonly<any>): Uint8Array => {
                const raw = atob(args[0].toString());
                return FunctionUtils.toBinary(raw);
            }, FunctionUtils.verifyString);
    }
}