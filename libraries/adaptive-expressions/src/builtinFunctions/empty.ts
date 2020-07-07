import { ComparisonEvaluator } from "./comparisonEvaluator";
import { ExpressionType } from "../expressionType";
import { FunctionUtils } from "../functionUtils";

export class Exists extends ComparisonEvaluator {
    public constructor() {
        super(ExpressionType.Exists, Exists.func, FunctionUtils.validateUnary, FunctionUtils.verifyContainer);
    }

    private static func(args: any[]): boolean {
        return FunctionUtils.isEmpty(args[0]);
    }
}