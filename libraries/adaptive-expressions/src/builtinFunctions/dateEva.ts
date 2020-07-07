import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import moment from 'moment';

export class DateEva extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Date, DateEva.evaluator(), ReturnType.String, FunctionUtils.validateUnaryString);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => FunctionUtils.parseTimestamp(args[0], (timestamp: Date): string => moment(timestamp).utc().format('M/DD/YYYY')),
            FunctionUtils.verifyString);
    }
}