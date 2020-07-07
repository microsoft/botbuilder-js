import { StringTransformEvaluator } from "./stringTransformEvaluator";
import { ExpressionType } from "..";
import { FunctionUtils } from "../functionUtils";

export class Trim extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.Trim, Trim.evaluator);
    }

    private static evaluator(args: any[]): string {
        return String(FunctionUtils.parseStringOrNull(args[0])).trim();
    }
}