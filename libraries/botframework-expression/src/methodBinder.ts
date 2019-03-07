import { EvaluationDelegate } from './operatorEntry';

export type GetMethodDelegate = (name: string) => EvaluationDelegate;

/**
 * Implementations of <see cref="GetMethodDelegate"/>.
 */
export abstract class MethodBinder {
    public static readonly All: GetMethodDelegate = (name: string) => {
        switch (name) {
            case 'min': return (parameters: any[]) => parameters[0] < parameters[1] ? parameters[0] : parameters[1];
            case 'max': return (parameters: any[]) => parameters[0] > parameters[1] ? parameters[0] : parameters[1];
            default: throw new Error();
        }
    }
}
