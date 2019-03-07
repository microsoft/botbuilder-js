import { EvaluationDelegate } from "./operatorEntry";

export type GetMethodDelegate = (name: string) => EvaluationDelegate;

export abstract class MethodBinder {
    public static readonly All: GetMethodDelegate = (name: string) => {
        switch (name) {
            case "min": return (parameters) => parameters[0] < parameters[1] ? parameters[0] : parameters[1];
            case "max": return (parameters) => parameters[0] > parameters[1] ? parameters[0] : parameters[1];
        }
        throw new Error();
    }
}
