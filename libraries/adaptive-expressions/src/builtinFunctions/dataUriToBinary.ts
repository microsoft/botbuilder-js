import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class DataUriToBinary extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.DataUriToBinary, DataUriToBinary.evaluator(), ReturnType.Object, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): Uint8Array => FunctionUtils.toBinary(args[0]), FunctionUtils.verifyString);
    }
}