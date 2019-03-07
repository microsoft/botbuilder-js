import { BindingDirection } from "./bindingDirection";
export type EvaluationDelegate = (parameters: any[]) => any;

export class OperatorEntry {

    public static From(token: string,
                       power: number,
                       direction: BindingDirection,
                       minArgs: number,
                       maxArgs: number,
                       evaluate: EvaluationDelegate): OperatorEntry {
        return new OperatorEntry(token, power, direction, minArgs, maxArgs, evaluate);
    }

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

    public ToString(): string {
        return this.Token;
    }

}
