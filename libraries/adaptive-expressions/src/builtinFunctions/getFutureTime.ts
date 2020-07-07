import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import moment from 'moment';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';

export class GetFutureTime extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.GetFutureTime, GetFutureTime.evaluator, ReturnType.String, GetFutureTime.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: any;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            if (Number.isInteger(args[0]) && typeof args[1] === 'string') {
                const format: string = (args.length === 3 ? FunctionUtils.timestampFormatter(args[2]) : FunctionUtils.DefaultDateTimeFormat);
                const {duration, tsStr} = FunctionUtils.timeUnitTransformer(args[0], args[1]);
                if (tsStr === undefined) {
                    error = `${args[2]} is not a valid time unit.`;
                } else {
                    const dur: any = duration;
                    ({value, error} = FunctionUtils.parseTimestamp(new Date().toISOString(), (dt: Date): string => {
                        return moment(dt).utc().add(dur, tsStr).format(format)}));
                }
            } else {
                error = `${expression} can't evaluate.`;
            }
        }

        return {value, error};
    }


    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Number, ReturnType.String);
    }
}