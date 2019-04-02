import {ExpressionEvaluator, EvaluateExpressionDelegate} from './expressionEvaluator';
import {BuiltInFunctions} from './buildInFunction';
import { ExpressionType } from './expressionType';
import {Constant} from './constant';
export enum ReturnType {
    /// <summary>
    /// True or false boolean value.
    /// </summary>
    Boolean,

    /// <summary>
    /// Numerical value like int, float, double, ...
    /// </summary>
    Number,

    /// <summary>
    /// Any value is possible.
    /// </summary>
    Object,

    /// <summary>
    /// String value.
    /// </summary>
    String
}

export class Expression {
    public readonly Type:string;
    public Children: Expression[];

    protected readonly _evaluator:ExpressionEvaluator; 
    public constructor(type: string, evaluator: ExpressionEvaluator = undefined, ...children: Expression[]) {
        this.Type = type;
        this._evaluator = evaluator == undefined ? BuiltInFunctions.Lookup(type) : evaluator;
        this.Children = children;
    }

    public get ReturnType():ReturnType {
        return this._evaluator.ReturnType;
    }

    public Validate(): void {
        this._evaluator.ValidateExpression(this);
    }

    public ValidateTree(): void {
        this.Validate();
        for (const child of this.Children) {
            child.Validate();
        }
    }

    public TryEvaluate(state: any): {value: any; error: string} {
        return this._evaluator.TryEvaluate(this, state);
    }

    public toString() : string {
        return this.ToString(this.Type);
    }

    protected ToString(name: string): string {
        let builder: string = "";
        builder.concat(name, "(");
        let first : boolean = true;
        for (const child of this.Children) {
            if(first) {
                first = false;
            }
            else {
                builder.concat(", ");
            }

            builder.concat(child.toString());
        }
        builder.concat(")");
        return builder;
    }

    public static MakeExpression(type: string, evaluator: ExpressionEvaluator = undefined, ...children: Expression[]) {
        const expr = new Expression(type, evaluator, ...children);
        expr.Validate();
        return expr;
    }

    public static LambaExpression(func: EvaluateExpressionDelegate): Expression{
        return new Expression(ExpressionType.Lambda, new ExpressionEvaluator(func));
    }

    public static Lambda(func: (arg0: any) => any): Expression {
        return new Expression(ExpressionType.Lambda, new ExpressionEvaluator(
            (expression: Expression, state: any):{value: any; error: string}  => {
                let value: any = undefined;
                let error: string = undefined;
                try {
                    value = func(state);
                } catch (funcError) {
                    error = funcError;
                }
                return {value, error};
            }
        ));
    }

    public static AndExpression(...children: Expression[]): Expression {
        return Expression.MakeExpression(ExpressionType.And, undefined, ...children);
    }

    public static OrExpression(...children: Expression[]): Expression {
        return Expression.MakeExpression(ExpressionType.Or, undefined, ...children);
    }

    public static NotExpression(child: Expression): Expression {
        return Expression.MakeExpression(ExpressionType.Not, undefined, child);
    }

    public static ConstantExpression(value: any){
        return new Constant(value);
    }

    public static Accessor(property: string, instance: Expression = undefined) {
        return instance === undefined
        ? Expression.MakeExpression(ExpressionType.Accessor, undefined, Expression.ConstantExpression(property))
        : Expression.MakeExpression(ExpressionType.Accessor, undefined, Expression.ConstantExpression(property), instance);
    }
}