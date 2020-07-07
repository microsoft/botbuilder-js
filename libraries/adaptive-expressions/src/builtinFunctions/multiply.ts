import { MultivariateNumericEvaluator } from "./multivariateNumericEvaluator";
import { ExpressionType } from "../expressionType";

export class Multiply extends MultivariateNumericEvaluator {
    public constructor() {
        super(ExpressionType.Multiply, Multiply.func);
    }

    private static func(args: any[]): number {
        return Number(args[0]) * Number(args[1]);
    }
}