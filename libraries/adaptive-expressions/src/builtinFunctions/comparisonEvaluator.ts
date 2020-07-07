import { ExpressionEvaluator, EvaluateExpressionDelegate, ValidateExpressionDelegate } from '../expressionEvaluator';
import { VerifyExpression, FunctionUtils } from '../functionUtils';
import { ReturnType, Expression } from '../expression';
import { MemoryInterface, Options } from '..';

export class ComparisonEvaluator extends ExpressionEvaluator {
    public constructor(type: string, func: (arg0: any[]) => boolean, validator: ValidateExpressionDelegate, verify?: VerifyExpression) {
        super(type, ComparisonEvaluator.evaluator(func, verify), ReturnType.Boolean, validator);
    }

    private static evaluator(func: (args: any[]) => boolean, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} => {
            let result = false;
            let error: string;
            let args: any[];
            const newOptions = new Options(options);
            newOptions.nullSubstitution = undefined;
            ({args, error} = FunctionUtils.evaluateChildren(expression, state, newOptions, verify));
            if (!error) {
                const isNumber: boolean = args && args.length > 0 && typeof args[0] === 'number';
                for (const arg of args) {
                    if (arg && (typeof arg === 'number') !== isNumber) {
                        error = `Arguments must either all be numbers or strings in ${expression}`;
                        break;
                    }
                }

                if (!error) {
                    try {
                        result = func(args);
                    } catch (e) {
                        // NOTE: This should not happen in normal execution
                        error = e.message;
                    }
                }
            } else {
                error = undefined;
            }

            return {value: result, error};
        };
    }
}