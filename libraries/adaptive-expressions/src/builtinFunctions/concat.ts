import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class Concat extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Concat, Concat.evaluator(), ReturnType.String | ReturnType.Array, FunctionUtils.validateAtLeastOne);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applySequence((args: any[]): string => {
            const firstItem = args[0];
            const secondItem = args[1];
            const isFirstList = Array.isArray(firstItem);
            const isSecondList = Array.isArray(secondItem);
    
            if ((firstItem === null || firstItem === undefined)
                && (secondItem === null || secondItem === undefined)) {
                return undefined;
            } else if ((firstItem === null || firstItem === undefined) && isSecondList){
                return secondItem;
            } else if ((secondItem === null || secondItem === undefined) && isFirstList){
                return firstItem;
            } else if (isFirstList && isSecondList){
                return firstItem.concat(secondItem);
            } else {
                return FunctionUtils.commonStringify(firstItem) + FunctionUtils.commonStringify(secondItem);
            }
        });
    }
}