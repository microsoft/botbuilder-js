import { ExpressionEvaluator } from "../expressionEvaluator";
import { FunctionUtils } from "../functionUtils";
import { ReturnType } from "../expression";

export class StringTransformEvaluator extends ExpressionEvaluator {
    public constructor(type: string, func: (arg0: any[]) => string) {
        super(type, FunctionUtils.apply(func, FunctionUtils.verifyStringOrNull),
            ReturnType.String, FunctionUtils.validateUnaryString);
    }
}