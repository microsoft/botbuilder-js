import { StringTransformEvaluator } from "./stringTransformEvaluator";
import { ExpressionType } from "..";
import { FunctionUtils } from "../functionUtils";

export class TitleCase extends StringTransformEvaluator {
    public constructor() {
        super(ExpressionType.TitleCase, TitleCase.evaluator);
    }

    private static evaluator(args: any[]): string {
        const inputStr = String(FunctionUtils.parseStringOrNull(args[0])).toLowerCase();
        if (inputStr === '') {
            return inputStr;
        } else {
            return inputStr.replace(/\w\S*/g, (txt): string => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        }
    }
}