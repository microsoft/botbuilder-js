import { BindingDirection } from './bindingDirection';

/**
 * Delegate which evaluates operators operands (aka the paramters) to the result
 */
export type EvaluationDelegate = (parameters: any[]) => any;

/**
 * Schema for entry in table of operators
 */
export class OperatorEntry {

    public readonly Token: string;
    public readonly Power: number;
    public readonly Direction: BindingDirection;
    public readonly MinArgs: number;
    public readonly MaxArgs: number;
    public readonly Evaluate: EvaluationDelegate;

    private constructor(token: string,
                        power: number,
                        direction: BindingDirection,
                        minArgs: number,
                        maxArgs: number,
                        evaluate: EvaluationDelegate) {
        this.Token = token;
        this.Power = power;
        this.Direction = direction;
        this.MinArgs = minArgs;
        this.MaxArgs = maxArgs;
        this.Evaluate = evaluate;
    }

    public static From(token: string,
                       power: number,
                       direction: BindingDirection,
                       minArgs: number,
                       maxArgs: number,
                       evaluate: EvaluationDelegate): OperatorEntry {
        return new OperatorEntry(token, power, direction, minArgs, maxArgs, evaluate);
    }

    public ToString(): string {
        return this.Token;
    }

}
