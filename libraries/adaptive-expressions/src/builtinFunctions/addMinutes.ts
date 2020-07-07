import { TimeTransformEvaluator } from "./timeTransformEvaluator";
import moment from "moment";
import { ExpressionType } from "../expressionType";

export class AddMinutes extends TimeTransformEvaluator {
    public constructor() {
        super(ExpressionType.AddMinutes, (ts: Date, num: any): Date => moment(ts).utc().add(num, 'minutes').toDate());
    }
}