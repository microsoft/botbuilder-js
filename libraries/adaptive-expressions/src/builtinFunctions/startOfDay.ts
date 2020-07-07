import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import moment from 'moment';

export class StartOfDay extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.StartOfDay, StartOfDay.evaluator, ReturnType.String, StartOfDay.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            const format: string = (args.length === 2) ? FunctionUtils.timestampFormatter(args[1]) : FunctionUtils.DefaultDateTimeFormat;
            if (typeof (args[0]) === 'string') {
                ({value, error} = FunctionUtils.startOfDay(args[0], format));
            } else {
                error = `${expression} cannot evaluate`;
            }
        }

        return {value, error};
    }


    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.String);
    }
}