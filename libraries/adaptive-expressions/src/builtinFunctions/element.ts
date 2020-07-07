import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';

export class Element extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Element, Element.evaluator, ReturnType.Object, FunctionUtils.validateBinary);
    }

    public static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        const instance: Expression = expression.children[0];
        const index: Expression = expression.children[1];
        let inst: any;
        ({value: inst, error} = instance.tryEvaluate(state, options));
        if (!error) {
            let idxValue: any;
            const newOptions = new Options(options);
            newOptions.nullSubstitution = undefined;
            ({value: idxValue, error} = index.tryEvaluate(state, newOptions));
            if (!error) {
                if (Number.isInteger(idxValue)) {
                    ({value, error} = FunctionUtils.accessIndex(inst, Number(idxValue)));
                } else if (typeof idxValue === 'string') {
                    ({value, error} = FunctionUtils.accessProperty(inst, idxValue.toString()));
                } else {
                    error = `Could not coerce ${index} to an int or string.`;
                }

                return {value, error};
            }
        }
    }
}