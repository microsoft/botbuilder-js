import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';

export class Substring extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Substring, Substring.evaluator, ReturnType.String, Substring.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let result: any;
        let error: any;
        let str: string;
        ({value: str, error} = expression.children[0].tryEvaluate(state, options));

        if (!error) {
            if (typeof str === 'string') {
                let start: number;

                const startExpr: Expression = expression.children[1];
                ({value: start, error} = startExpr.tryEvaluate(state, options));
                if (!error && !Number.isInteger(start)) {
                    error = `${startExpr} is not an integer.`;
                } else if (start < 0 || start >= str.length) {
                    error = `${startExpr}=${start} which is out of range for ${str}`;
                }
                if (!error) {
                    let length: number;
                    if (expression.children.length === 2) {
                        // Without length, compute to end
                        length = str.length - start;
                    } else {
                        const lengthExpr: Expression = expression.children[2];
                        ({value: length, error} = lengthExpr.tryEvaluate(state, options));
                        if (!error && !Number.isInteger(length)) {
                            error = `${lengthExpr} is not an integer`;
                        } else if (length < 0 || Number(start) + Number(length) > str.length) {
                            error = `${lengthExpr}=${length} which is out of range for ${str}`;
                        }
                    }
                    if (!error) {
                        result = str.substr(start, length);
                    }
                }
            } else if (str === undefined) {
                result = '';
            } else {
                error = `${expression.children[0]} is neither a string nor a null object.`;
            }
        }

        return {value: result, error};
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.Number], ReturnType.String, ReturnType.Number);
    }
}