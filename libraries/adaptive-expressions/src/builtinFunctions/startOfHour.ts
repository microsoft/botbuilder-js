import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';

export class StartOfHour extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.StartOfHour, StartOfHour.evaluator, ReturnType.String, StartOfHour.validator);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            const format: string = (args.length === 2) ? FunctionUtils.timestampFormatter(args[1]) : FunctionUtils.DefaultDateTimeFormat;
            if (typeof (args[0]) === 'string') {
                ({value, error} = FunctionUtils.startOfHour(args[0], format));
            } else {
                error = `${expr} cannot evaluate`;
            }
        }

        return {value, error};
    }


    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, [ReturnType.String], ReturnType.String);
    }
}