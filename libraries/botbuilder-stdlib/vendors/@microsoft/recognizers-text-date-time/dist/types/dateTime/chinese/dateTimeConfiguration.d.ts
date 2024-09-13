import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseDateTimeExtractor, BaseDateTimeParser } from "../baseDateTime";
import { Token, DateTimeResolutionResult } from "../utilities";
import { DateTimeParseResult } from "../parsers";
export declare class ChineseDateTimeExtractor extends BaseDateTimeExtractor {
    constructor();
    extract(source: string, refDate: Date): Array<ExtractResult>;
    protected mergeDateAndTime(source: string, refDate: Date): Array<Token>;
    private timeOfToday(source, refDate);
}
export declare class ChineseDateTimeParser extends BaseDateTimeParser {
    constructor();
    parse(er: ExtractResult, refTime?: Date): DateTimeParseResult;
    protected mergeDateAndTime(text: string, referenceTime: Date): DateTimeResolutionResult;
    protected parseTimeOfToday(text: string, referenceTime: Date): DateTimeResolutionResult;
}
