import { StringTransformEvaluator } from "./stringTransformEvaluator";
import { ExpressionType } from "..";
import { FunctionUtils } from "../functionUtils";

export class ToUpper extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.ToUpper, ToUpper.evaluator);
    }

    private static evaluator(args: any[]): string {
        return String(FunctionUtils.parseStringOrNull(args[0])).toUpperCase();
    }
}