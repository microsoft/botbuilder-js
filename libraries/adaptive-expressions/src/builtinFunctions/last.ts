import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class Last extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Last, Last.evaluator(), ReturnType.Object, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): any => {
                let last: any;
                if (typeof args[0] === 'string' && args[0].length > 0) {
                    last = args[0][args[0].length - 1];
                }

                if (Array.isArray(args[0]) && args[0].length > 0) {
                    last = FunctionUtils.accessIndex(args[0], args[0].length - 1).value;
                }

                return last;
            });
    }
}