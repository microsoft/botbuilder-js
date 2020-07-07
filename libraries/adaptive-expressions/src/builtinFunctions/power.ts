import { MultivariateNumericEvaluator } from "./multivariateNumericEvaluator";
import { ExpressionType } from "../expressionType";

export class Power extends MultivariateNumericEvaluator {
    public constructor() {
        super(ExpressionType.Power, Power.func);
    }

    private static func(args: any[]): number {
        return Math.pow(args[0], args[1]);
    }
}