import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { parseZone } from 'moment';

export class GetTimeOfDay extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.GetTimeOfDay, GetTimeOfDay.evaluator(), ReturnType.String, FunctionUtils.validateUnaryString);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let value: any;
                const error: string = FunctionUtils.verifyISOTimestamp(args[0]);
                if (!error) {
                    const thisTime: number = parseZone(args[0]).hour() * 100 + parseZone(args[0]).minute();
                    if (thisTime === 0) {
                        value = 'midnight';
                    } else if (thisTime > 0 && thisTime < 1200) {
                        value = 'morning';
                    } else if (thisTime === 1200) {
                        value = 'noon';
                    } else if (thisTime > 1200 && thisTime < 1800) {
                        value = 'afternoon';
                    } else if (thisTime >= 1800 && thisTime <= 2200) {
                        value = 'evening';
                    } else if (thisTime > 2200 && thisTime <= 2359) {
                        value = 'night';
                    }
                }

                return {value, error};
            },
            FunctionUtils.verifyString);
    }
}