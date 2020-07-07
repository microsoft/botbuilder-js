import { StringTransformEvaluator } from "./stringTransformEvaluator";
import { ExpressionType } from "..";
import { FunctionUtils } from "../functionUtils";

export class ToLower extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.ToLower, ToLower.evaluator);
    }

    private static evaluator(args: any[]): string {
        return String(FunctionUtils.parseStringOrNull(args[0])).toLowerCase();
    }
}