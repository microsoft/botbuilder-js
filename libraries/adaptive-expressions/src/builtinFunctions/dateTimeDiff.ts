import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';

export class DateTimeDiff extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.DateTimeDiff, DateTimeDiff.evaluator, ReturnType.Number, DateTimeDiff.validator);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let dateTimeStart: any;
        let dateTimeEnd: any;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            ({value: dateTimeStart, error: error} = FunctionUtils.ticks(args[0]));
            if (!error) {
                ({value: dateTimeEnd, error: error} = FunctionUtils.ticks(args[1]));
            }
        }

        if (!error) {
            value = dateTimeStart - dateTimeEnd;
        }

        return {value, error};
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2, ReturnType.String);
    }
}