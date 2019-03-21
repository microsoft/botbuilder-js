import { BuildinFunctions } from './buildInFunctions';

export type EvaluationDelegate = (parameters: any[]) => any;

export type GetMethodDelegate = (name: string) => EvaluationDelegate;

/**
 * Implementations of <see cref="GetMethodDelegate"/>.
 */
export abstract class MethodBinder {
    public static readonly All: GetMethodDelegate = (name: string) => {
        const functionMap: Map<string, EvaluationDelegate> = MethodBinder.FunctionMap();
        if (functionMap.has(name)) {
            return functionMap.get(name);
        }

        throw Error(`Operation ${name} is invalid.`);
    }

    private static readonly FunctionMap = (): Map<string, EvaluationDelegate> => {
        let functionMap: Map<string, EvaluationDelegate> = new Map<string, EvaluationDelegate>();
        functionMap.set('/', BuildinFunctions.Div);
        functionMap.set('*', BuildinFunctions.Mul);
        functionMap.set('+', BuildinFunctions.Add);
        functionMap.set('-', BuildinFunctions.Sub);

        return functionMap;
    }
}
