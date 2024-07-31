import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseDateTimeExtractor } from "./baseDateTime";
import { BaseTimePeriodParser } from "../baseTimePeriod";
import { DateTimeParseResult } from "../parsers";
export declare enum TimePeriodType {
    ShortTime = 0,
    FullTime = 1,
}
export declare class ChineseTimePeriodExtractor extends BaseDateTimeExtractor<TimePeriodType> {
    protected extractorName: string;
    constructor();
}
export declare class ChineseTimePeriodParser extends BaseTimePeriodParser {
    private readonly dayDescriptionRegex;
    private readonly onlyDigitMatch;
    private readonly lowBoundMap;
    private readonly numbersMap;
    constructor();
    parse(er: ExtractResult, referenceTime?: Date): DateTimeParseResult;
    private parseChineseTimeOfDay(text, referenceTime);
    private GetMatchedTimexRange(text);
    private parseTimePeriod(extra, referenceTime);
    private getParseTimeResult(entity, referenceTime);
    private getShortLeft(source);
    private buildDate(time, referenceTime);
    private buildTimex(timeResult);
    private buildSpan(left, right);
    private sanitizeTimeResult(timeResult);
}
