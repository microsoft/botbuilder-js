import { Expression, ReturnType } from "./expression";
import { EvaluateExpressionDelegate, ExpressionEvaluator } from "./expressionEvaluator";
import { ExpressionType } from "./expressionType";

export class BuiltInFunctions {
    public static ValidateArityAndAnyType(expression: Expression, minArity: number, maxArity: number, ...types: ReturnType[]): void {
        if(expression.Children.length < minArity) {
            throw new Error(`${expression} should have at least ${minArity} children.`);
        }
        if(expression.Children.length > maxArity) {
            throw new Error(`${expression} can't have more than ${maxArity} children.`);
        }

        if(types.length > 0) {
            for (const child of expression.Children) {
                if(child.ReturnType !== ReturnType.Object && !types.includes(child.ReturnType)) {
                    if(types.length === 1) {
                        throw new Error(`${child} is not a ${types[0]} expression in ${expression}.`);
                    }
                    else {
                        let builder: string = `${child} in ${expression} is not any of [`;
                        let first: boolean = true;
                        for (const type of types) {
                            if(first) {
                                first = false;
                            }
                            else {
                                builder.concat(". ");
                            }
                            builder.concat(type.toString());
                        }
                        builder.concat("].");
                        throw new Error(builder);
                    }
                }
            }
        }
    }


    public static ValidateOrder(expression: Expression, optional: ReturnType[], ...types: ReturnType[]): void {
        if(optional === undefined) {
            optional = [];
        }
        if(expression.Children.length < types.length || expression.Children.length > types.length + optional.length) {
            throw new Error(optional.length === 0 ? 
                `${expression} should have ${types.length} children.`
                : `${expression} should have between ${types.length} and ${types.length + optional.length} children.`);
        }

        for(let i = 0;i < types.length; i++) {
            const child: Expression = expression.Children[i];
            const type: ReturnType = types[i];
            if(type !== ReturnType.Object && child.ReturnType != ReturnType.Object && child.ReturnType != type) {
                throw new Error(`${child} in ${expression} is not a ${type}.`);
            }
        }

        for(let i = 0; i < optional.length; i++) {
            const ic: number = i + types.length;
            if(ic >= expression.Children.length) {
                break;
            }
            const child: Expression = expression.Children[ic];
            const type = optional[i];
            if(child.ReturnType !== type) {
                throw new Error(`${child} in ${expression} is not a ${type}.`);
            }
        }
    }

    public static ValidateNumber(expression: Expression): void {
        return BuiltInFunctions.ValidateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.Number);
    }

    public static ValidateBoolean(expression: Expression): void {
        return BuiltInFunctions.ValidateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.Boolean);
    }

    public static ValidateString(expression: Expression): void {
        return BuiltInFunctions.ValidateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.String);
    }

    public static ValidateBinary(expression: Expression): void {
        return BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 2);
    }

    public static ValidateBinaryNumber(expression: Expression): void {
        return BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 2, ReturnType.Number);
    }

    public static ValidateBinaryNumberOrString(expression: Expression): void {
        return BuiltInFunctions.ValidateArityAndAnyType(expression, 2, 2, ReturnType.Number, ReturnType.String);
    }

    public static ValidateUnary(expression: Expression): void {
        return BuiltInFunctions.ValidateArityAndAnyType(expression, 1, 1);
    }

    public static ValidateUnaryString(expression: Expression): void {
        return BuiltInFunctions.ValidateArityAndAnyType(expression, 1, 1, ReturnType.String);
    }

    public static ValidateUnaryBoolean(expression: Expression): void {
        return BuiltInFunctions.ValidateOrder(expression, undefined,ReturnType.Boolean);
    }

    public static VerifyNumber(value: any, expression: Expression): string {
        let error: string = undefined;
        if(!Number.isNaN(value)) {
            error = `${expression} is not a number.`;
        }
        return error;
    }

    public static VerifyInteger(value: any, expression: Expression): string {
        let error: string = undefined;
        if(!Number.isInteger(value)) {
            error = `${expression} is not a integer.`;
        }
        return error;
    }

    public static VerifyString(value: any, expression: Expression): string {
        let error: string = undefined;
        if(typeof value !== "string") {
            error = `${expression} is not a string.`;
        }
        return error;
    }

    public static VerifyNumberOrString(value: any, expression: Expression): string {
        let error: string = undefined;
        if(value != undefined && !Number.isNaN(value) && typeof value !== "string") {
            error = `${expression} is not string or number.`;
        }
        return error;
    }

    public static VerifyBoolean(value: any, expression: Expression): string {
        let error: string = undefined;
        if(typeof value !== "boolean") {
            error = `${expression} is not a boolean.`;
        }
        return error;
    }

    public static EvaluateChildren(expression: Expression, state: any, verify: (arg0:any, arg1:Expression) => any = undefined) 
    : {args:ReadonlyArray<any>; error: string} {
        let args: Array<any> = [];
        let value: any = undefined;
        let error: string = undefined;
        for (const child of expression.Children) {
           ({value, error} = child.TryEvaluate(state));
           if(error !== undefined) {
               break;
           }
           if(verify != undefined) {
               error = verify(value, child);
           }
           if(error !== undefined) {
               break;
           }
           args.push(value);
        }
        return {args, error};
    }

    public static Apply(func:(arg0: ReadonlyArray<any>) => any, verify: (arg0: any, arg1: Expression) => string = undefined): EvaluateExpressionDelegate {
        return (expression: Expression, state: any):{value: any;error:string} => {
            let value: any = undefined;
            let error: string = undefined;
            let args: ReadonlyArray<any> = undefined;
            ({args, error} = BuiltInFunctions.EvaluateChildren(expression, state, verify));
            if(error === undefined) {
                value = func(args);
            }

            return {value, error};
        }
    }

    public static ApplySequence(func:(arg0: ReadonlyArray<any>) => any, verify: (arg0: any, arg1: Expression) => string = undefined): EvaluateExpressionDelegate {
        return BuiltInFunctions.Apply(
            (args:ReadonlyArray<any>):any => {
                let binaryArgs: any[] = [undefined, undefined];
                let soFar = args[0];
                for(let i = 0; i < args.length; i++) {
                    binaryArgs[0] = soFar;
                    binaryArgs[1] = args[i];
                    soFar = func(binaryArgs);
                }
                return soFar;
            },
            verify
        );
    }

    public static Numeric(func:(arg0: ReadonlyArray<any>) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(BuiltInFunctions.ApplySequence(func, BuiltInFunctions.VerifyNumber), ReturnType.Number,BuiltInFunctions.ValidateNumber);
    }

    public static Comparison(func:(arg0: ReadonlyArray<any>) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(BuiltInFunctions.Apply(func, BuiltInFunctions.VerifyNumberOrString), ReturnType.Boolean,BuiltInFunctions.ValidateBinaryNumberOrString);
    }

    public static StringTransform(func:(arg0: ReadonlyArray<any>) => any): ExpressionEvaluator {
        return new ExpressionEvaluator(BuiltInFunctions.Apply(func, BuiltInFunctions.VerifyString), ReturnType.String,BuiltInFunctions.ValidateUnaryString);
    }

    public static Lookup(type: string) {
        const evaluator = BuiltInFunctions._functions.get(type);
        if(evaluator === undefined) {
            throw new Error(`${type} does not have a built-in expression evaluator.`);
        }

        return evaluator;
    }

    private static BuildFunctionLookup(): Map<string, ExpressionEvaluator> {
        const functions =  new Map<string, ExpressionEvaluator>([
            //TODO
            //Math
            [ExpressionType.Add, BuiltInFunctions.Numeric(args => args[0] + args[1])],
            [ExpressionType.Multiply, BuiltInFunctions.Numeric(args => args[0] * args[1])]
        ]);

        return functions;
    }

    public static _functions: Map<string,ExpressionEvaluator> =  BuiltInFunctions.BuildFunctionLookup();
}