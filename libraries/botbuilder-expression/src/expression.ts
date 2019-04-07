import { BuiltInFunctions } from './buildInFunction';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from './expressionEvaluator';
import { ExpressionType } from './expressionType';

/**
 * Type expected from evalating an expression.
 */
export enum ReturnType {
    /**
     * True or false boolean value.
     */
    Boolean = "boolean",

    /**
     * Numerical value like int, float, double, ...
     */
    Number = "number",

    /**
     * Any value is possible.
     */
    Object = "object",

    /**
     * String value.
     */
    String = "string"
}

/**
 * An expression which can be analyzed or evaluated to produce a value.
 * This provides an open-ended wrapper that supports a number of built-in functions and can also be extended at runtime.
 * It also supports validation of the correctness of an expression and evaluation that should be exception free.
 */
export class Expression {

    /**
     * Expected result of evaluating expression.
     */
    public get ReturnType(): ReturnType {
        return this._evaluator.ReturnType;
    }
    public readonly Type: string;

    /**
     * Children expressions.
     */
    public Children: Expression[];

    protected readonly _evaluator: ExpressionEvaluator;

    /**
     * xpression constructor.
     * @param type Type of expression from ExpressionType
     * @param evaluator Information about how to validate and evaluate expression.
     * @param children Child expressions.
     */
    public constructor(type: string, evaluator: ExpressionEvaluator, ...children: Expression[]) {
        this.Type = type;
        this._evaluator = evaluator === undefined ? BuiltInFunctions.Lookup(type) : evaluator;
        this.Children = children;
    }


    /**
     * Make an expression and validate it.
     * @param type Type of expression from ExpressionType
     * @param evaluator Information about how to validate and evaluate expression.
     * @param children Child expressions.
     */
    public static MakeExpression(type: string, evaluator: ExpressionEvaluator, ...children: Expression[]): Expression {
        const expr: Expression = new Expression(type, evaluator, ...children);
        expr.Validate();

        return expr;
    }

    /**
     * Construct an expression from a EvaluateExpressionDelegate
     * @param func Function to create an expression from.
     */
    public static LambaExpression(func: EvaluateExpressionDelegate): Expression {
        return new Expression(ExpressionType.Lambda, new ExpressionEvaluator(func));
    }

    /**
     * Construct an expression from a lamba expression over the state.
     * Exceptions will be caught and surfaced as an error string.
     * @param func ambda expression to evaluate.
     * @returns New expression.
     */
    public static Lambda(func: (arg0: any) => any): Expression {
        return new Expression(ExpressionType.Lambda, new ExpressionEvaluator(
            (expression: Expression, state: any): { value: any; error: string } => {
                let value: any;
                let error: string;
                try {
                    value = func(state);
                } catch (funcError) {
                    error = funcError;
                }

                return { value, error };
            }
        ));
    }

    /**
     * Construct and validate an And expression.
     * @param children Child clauses.
     * @returns New expression.
     */
    public static AndExpression(...children: Expression[]): Expression {
        return Expression.MakeExpression(ExpressionType.And, undefined, ...children);
    }

    /**
     * Construct and validate an Or expression.
     * @param children Child clauses.
     * @returns New expression.
     */
    public static OrExpression(...children: Expression[]): Expression {
        return Expression.MakeExpression(ExpressionType.Or, undefined, ...children);
    }

    /**
     * Construct and validate an Not expression.
     * @param children Child clauses.
     * @returns New expression.
     */
    public static NotExpression(child: Expression): Expression {
        return Expression.MakeExpression(ExpressionType.Not, undefined, child);
    }

    /**
    * Construct and validate an Constant expression.
    * @param children Child clauses.
    * @returns New expression.
    */
   /* deprecated
    public static ConstantExpression(value: any): Expression {
        // TODO this make Circular reference and could make error in typescript
        return new Constant(value);
        //return undefined;
    }
*/
    //Please direct use it
    /**
     * Construct and validate a property accessor.
     * @param property Property to lookup.
     * @param instance Expression to get instance that contains property or null for global state.
     */
    /*
    public static Accessor(property: string, instance?: Expression): Expression {
        return instance === undefined
            ? Expression.MakeExpression(ExpressionType.Accessor, undefined, Expression.ConstantExpression(property))
            : Expression.MakeExpression(ExpressionType.Accessor, undefined, Expression.ConstantExpression(property), instance);
    }
    */


    /**
     * Validate immediate expression.
     */
    public Validate(): void {
        this._evaluator.ValidateExpression(this);
    }

    /**
     * Recursively validate the expression tree.
     */
    public ValidateTree(): void {
        this.Validate();
        for (const child of this.Children) {
            child.Validate();
        }
    }

    /**
     * Evaluate the expression.
     * Global state to evaluate accessor expressions against.  Can Dictionary be otherwise reflection is used to access property and then indexer.
     * @param state 
     */
    public TryEvaluate(state: any): { value: any; error: string } {
        return this._evaluator.TryEvaluate(this, state);
    }

    public toString(): string {
        return this.ToString(this.Type);
    }

    protected ToString(name: string): string {
        let builder: string = '';
        builder = builder.concat(name, '(');
        
        let first: boolean = true;
        for (const child of this.Children) {
            if (first) {
                first = false;
            } else {
                builder = builder.concat(', ');
            }

            builder = builder.concat(child.toString());
        }
        builder = builder.concat(')');
        return builder;
    }
}
