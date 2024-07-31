import { BaseDateTimePeriodParser, IDateTimePeriodParserConfiguration } from "../baseDateTimePeriod";
import { DateTimeResolutionResult } from "../utilities";
export declare class SpanishDateTimePeriodParser extends BaseDateTimePeriodParser {
    constructor(config: IDateTimePeriodParserConfiguration);
    protected parseSpecificTimeOfDay(source: string, referenceDate: Date): DateTimeResolutionResult;
}
