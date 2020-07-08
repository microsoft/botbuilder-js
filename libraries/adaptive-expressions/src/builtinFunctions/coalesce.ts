import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class Coalesce extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Coalesce, Coalesce.evaluator(), ReturnType.Object, FunctionUtils.validateAtLeastOne);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[][]): any => Coalesce.evalCoalesce(args as any[]));
    }

    public static evalCoalesce(objetcList: object[]): any {
        for (const obj of objetcList) {
            if (obj !== null && obj !== undefined) {
                return obj;
            }
        }

        return undefined;
    }
}