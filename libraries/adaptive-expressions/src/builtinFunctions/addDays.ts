import { TimeTransformEvaluator } from "./timeTransformEvaluator";
import moment from "moment";
import { ExpressionType } from "../expressionType";

export class AddDays extends TimeTransformEvaluator {
    public constructor() {
        super(ExpressionType.AddDays, (ts: Date, num: any): Date =>  moment(ts).utc().add(num, 'd').toDate());
    }
}