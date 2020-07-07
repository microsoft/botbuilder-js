import { ComparisonEvaluator } from "./comparisonEvaluator";
import { ExpressionType } from "../expressionType";
import { FunctionUtils } from "../functionUtils";

export class NotEqual extends ComparisonEvaluator {
    public constructor() {
        super(ExpressionType.NotEqual, NotEqual.func, FunctionUtils.validateBinary);
    }

    private static func(args: any[]): boolean {
        return !FunctionUtils.isEqual(args);
    }
}