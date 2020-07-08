import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class DataUriToString extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.DataUriToString, DataUriToString.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): string => Buffer.from(args[0].slice(args[0].indexOf(',') + 1), 'base64').toString(), FunctionUtils.verifyString);
    }
}