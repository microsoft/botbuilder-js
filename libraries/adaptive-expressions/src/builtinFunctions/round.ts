import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

export class Round extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Round, Round.evaluator(), ReturnType.Number, FunctionUtils.validateUnaryOrBinaryNumber);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let result: any;
                let error: string;
                if (args.length === 2 && !Number.isInteger(args[1])) {
                    error = `The second parameter ${ args[1] } must be an integer.`;
                }

                if (!error) {
                    const digits = args.length === 2 ? args[1] as number : 0;
                    if (digits < 0 || digits > 15) {
                        error = `The second parameter ${ args[1] } must be an integer between 0 and 15;`;
                    } else {
                        result = Round.roundToPrecision(args[0], digits);
                    }
                }

                return {value: result, error};
            },
            FunctionUtils.verifyNumber
        );
    }

    private static roundToPrecision = (num: number, digits: number): number => Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
}