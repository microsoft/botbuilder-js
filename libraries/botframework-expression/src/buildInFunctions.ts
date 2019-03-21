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
}
