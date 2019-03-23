import { EvaluationDelegate } from './methodBinder';
/**
 * Implementations of <see cref="BuildinFunctions"/>.
 */
export abstract class BuildinFunctions {
    public static Add = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] + operands[1]) :
        typeof operands[0] === 'string' && typeof operands[1] === 'string' ? <any>(operands[0] + operands[1]) :
        new Error()

    public static Sub = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] - operands[1]) :
        new Error()

    public static Mul = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] * operands[1]) :
        new Error()

    public static Div = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] / operands[1]) :
        new Error()

    public static Equal = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] === operands[1]) :
        typeof operands[0] === 'string' && typeof operands[1] === 'string' ? <any>(operands[0] === operands[1]) :
        new Error()

    public static NotEqual = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] !== operands[1]) :
        typeof operands[0] === 'string' && typeof operands[1] === 'string' ? <any>(operands[0] !== operands[1]) :
        new Error()

    public static Min = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] <= operands[1] ? operands[0] : operands[1]) :
        new Error()

    public static Max = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] >= operands[1] ? operands[0] : operands[1]) :
        new Error()

    public static LessThan = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] < operands[1]) :
        new Error()

    public static LessThanOrEqual = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] <= operands[1]) :
        new Error()

    public static GreaterThan = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] > operands[1]) :
        new Error()

    public static GreaterThanOrEqual = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] >= operands[1]) :
        new Error()

    public static Pow = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(Math.pow(operands[0],operands[1])) :
        new Error()

    public static And = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'boolean' && typeof operands[1] === 'boolean' ? <any>(operands[0] && operands[1]) :
        new Error()

    public static Or = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'boolean' && typeof operands[1] === 'boolean' ? <any>(operands[0] || operands[1]) :
        new Error()

    public static Not = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'boolean' ? !<boolean>operands[0] :
        typeof operands[0] === 'number' ? operands[0] === 0 :
        <any>(operands[0] === undefined || operands[0] === null || operands[0] === '')
}