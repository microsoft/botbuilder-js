import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class String extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.String, String.evaluator(), ReturnType.Number, FunctionUtils.validateBinaryNumber);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let error: string;
                if (args[0] > args[1]) {
                    error = `Min value ${args[0]} cannot be greater than max value ${args[1]}.`;
                }

                const value: any = Math.floor(Math.random() * (Number(args[1]) - Number(args[0])) + Number(args[0]));

                return {value, error};
            },
            FunctionUtils.verifyInteger);
    }
}