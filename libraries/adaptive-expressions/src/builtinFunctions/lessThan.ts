import { ComparisonEvaluator } from "./comparisonEvaluator";
import { ExpressionType } from "../expressionType";
import { FunctionUtils } from "../functionUtils";

export class LessThan extends ComparisonEvaluator {
    public constructor() {
        super(ExpressionType.LessThan, LessThan.func, FunctionUtils.validateBinaryNumberOrString, FunctionUtils.verifyNumberOrString);
    }

    private static func(args: any[]): boolean {
        return args[0] < args[1];
    }
}