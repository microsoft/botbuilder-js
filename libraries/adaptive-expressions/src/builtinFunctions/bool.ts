import { ComparisonEvaluator } from "./comparisonEvaluator";
import { ExpressionType } from "../expressionType";
import { FunctionUtils } from "../functionUtils";

export class Bool extends ComparisonEvaluator {
    public constructor() {
        super(ExpressionType.Bool, Bool.func, FunctionUtils.validateUnary);
    }

    private static func(args: any[]): boolean {
        return FunctionUtils.isLogicTrue(args[0]);
    }
}