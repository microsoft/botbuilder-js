import { ComparisonEvaluator } from "./comparisonEvaluator";
import { ExpressionType } from "../expressionType";
import { FunctionUtils } from "../functionUtils";

export class Equal extends ComparisonEvaluator {
    public constructor() {
        super(ExpressionType.Equal, FunctionUtils.isEqual, FunctionUtils.validateBinary);
    }
}