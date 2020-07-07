import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import moment from 'moment';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';

export class ConvertFromUTC extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.ConvertFromUTC, ConvertFromUTC.evaluator, ReturnType.String, ConvertFromUTC.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            const format: string = (args.length === 3) ? FunctionUtils.timestampFormatter(args[2]) : FunctionUtils.NoneUtcDefaultDateTimeFormat;
            if (typeof (args[0]) === 'string' && typeof (args[1]) === 'string') {
                ({value, error} = FunctionUtils.convertFromUTC(args[0], args[1], format));
            } else {
                error = `${expression} cannot evaluate`;
            }
        }

        return {value, error};
    }


    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.String, ReturnType.String);
    }
}