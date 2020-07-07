import { ComparisonEvaluator } from "./comparisonEvaluator";
import { ExpressionType } from "../expressionType";
import { FunctionUtils } from "../functionUtils";

export class GreaterThanOrEqual extends ComparisonEvaluator {
    public constructor() {
        super(ExpressionType.GreaterThanOrEqual, GreaterThanOrEqual.func, FunctionUtils.validateBinaryNumberOrString, FunctionUtils.verifyNumberOrString);
    }

    private static func(args: any[]): boolean {
        return args[0] >= args[1];
    }
}