import { BuildinFunctions } from './buildInFunctions';

export type EvaluationDelegate = (parameters: any[]) => any;

export type GetMethodDelegate = (name: string) => EvaluationDelegate;

/**
 * Implementations of <see cref="GetMethodDelegate"/>.
 */
export abstract class MethodBinder {
    private static readonly FunctionMap: Map<string, EvaluationDelegate> = new Map([
        ['div', BuildinFunctions.Div],
        ['mul', BuildinFunctions.Mul],
        ['add', BuildinFunctions.Add],
        ['sub', BuildinFunctions.Sub],
        ['equals', BuildinFunctions.Equal],
        ['notEquals', BuildinFunctions.NotEqual],
        ['min', BuildinFunctions.Min],
        ['max', BuildinFunctions.Max],
        ['less', BuildinFunctions.LessThan],
        ['lessOrEquals', BuildinFunctions.LessThanOrEqual],
        ['greater', BuildinFunctions.GreaterThan],
        ['greaterOrEquals', BuildinFunctions.GreaterThanOrEqual],
        ['exp', BuildinFunctions.Pow],
        ['and', BuildinFunctions.And],
        ['or', BuildinFunctions.Or],
        ['not', BuildinFunctions.Not]
    ]);

    public static readonly All: GetMethodDelegate = (name: string) => {
        if (MethodBinder.FunctionMap.has(name)) {
            return MethodBinder.FunctionMap.get(name);
        }

        throw Error(`Operation ${name} is invalid.`);
    }
}
