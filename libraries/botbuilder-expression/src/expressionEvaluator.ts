import { Expression, ReturnType} from './expression';

export type ValidateExpressionDelegate = (expression: Expression) => any;

export type EvaluateExpressionDelegate = (expression: Expression, state: any) => {value: any; error: string}

export type EvaluatorLookup = (type: string) => ExpressionEvaluator;

export class ExpressionEvaluator {
    private _validator: ValidateExpressionDelegate;
    private _evaluator: EvaluateExpressionDelegate;

    public ReturnType: ReturnType;

    public constructor(evaluator: EvaluateExpressionDelegate,
        returnType: ReturnType = ReturnType.Object,
        validator: ValidateExpressionDelegate = undefined) {
            this._evaluator = evaluator;
            this.ReturnType = returnType;
            this._validator = validator;
        }

    
    public TryEvaluate(expression: Expression, state: any): {value: any; error: string} {
        return this._evaluator(expression, state);
    } 

    public ValidateExpression(expression: Expression) : void {
        return this._validator(expression);
    }
}
