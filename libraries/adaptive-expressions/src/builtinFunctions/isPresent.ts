import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import {TimexProperty} from '@microsoft/recognizers-text-data-types-timex-expression';

export class IsPresent extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.IsPresent, IsPresent.evaluator, ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let parsed: TimexProperty;
        let value = false;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            ({timexProperty: parsed, error: error} = FunctionUtils.parseTimexProperty(args[0]));
        }

        if (parsed && !error) {
            value = parsed.now !== undefined;
        }

        return {value, error};
    }
}