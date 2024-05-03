import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseDateTimeExtractor } from "./baseDateTime";
import { BaseTimeParser } from "../baseTime";
import { DateTimeParseResult } from "../parsers";
export declare enum TimeType {
    ChineseTime = 0,
    LessTime = 1,
    DigitTime = 2,
}
export declare class ChineseTimeExtractor extends BaseDateTimeExtractor<TimeType> {
    protected extractorName: string;
    constructor();
}
export declare class ChineseTimeParser extends BaseTimeParser {
    private readonly onlyDigitMatch;
    private readonly numbersMap;
    private readonly lowBoundMap;
    private readonly functionMap;
    private readonly innerExtractor;
    constructor();
    parse(er: ExtractResult, referenceTime?: Date): DateTimeParseResult | null;
    private handleLess(extra);
    private handleChinese(extra);
    private handleDigit(extra);
    private packTimeResult(extra, timeResult, referenceTime);
    private matchToValue(source);
    private addDescription(timeResult, description);
}
