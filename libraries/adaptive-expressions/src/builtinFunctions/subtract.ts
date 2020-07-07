import { MultivariateNumericEvaluator } from "./multivariateNumericEvaluator";
import { ExpressionType } from "../expressionType";

export class Substract extends MultivariateNumericEvaluator {
    public constructor() {
        super(ExpressionType.Subtract, Substract.func);
    }

    private static func(args: any[]): number {
        return Number(args[0]) - Number(args[1]);
    }
}