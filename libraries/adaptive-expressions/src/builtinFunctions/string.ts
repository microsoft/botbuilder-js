import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class String extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.String, String.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): string => {
            return JSON.stringify(args[0])
                .replace(/(^\'*)/g, '')
                .replace(/(\'*$)/g, '')
                .replace(/(^\"*)/g, '')
                .replace(/(\"*$)/g, '');
        });
    }
}