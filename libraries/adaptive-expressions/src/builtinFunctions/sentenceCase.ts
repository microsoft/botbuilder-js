import { StringTransformEvaluator } from "./stringTransformEvaluator";
import { ExpressionType } from "..";
import { FunctionUtils } from "../functionUtils";

export class SentenceCase extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.SentenceCase, SentenceCase.evaluator);
    }

    private static evaluator(args: any[]): string {
        const inputStr = String(FunctionUtils.parseStringOrNull(args[0])).toLowerCase();
        if (inputStr === '') {
            return inputStr;
        } else {
            return inputStr.charAt(0).toUpperCase() + inputStr.substr(1).toLowerCase();
        }
    }
}