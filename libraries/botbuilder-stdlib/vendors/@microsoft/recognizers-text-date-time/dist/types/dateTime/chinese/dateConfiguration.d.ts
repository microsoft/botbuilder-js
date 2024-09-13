import { ExtractResult, Match } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseDateExtractor, BaseDateParser } from "../baseDate";
import { Token, DateTimeResolutionResult } from "../utilities";
import { DateTimeParseResult } from "../parsers";
export declare class ChineseDateExtractor extends BaseDateExtractor {
    private readonly durationExtractor;
    constructor();
    extract(source: string, refDate: Date): Array<ExtractResult>;
    protected durationWithBeforeAndAfter(source: string, refDate: Date): Array<Token>;
}
export declare class ChineseDateParser extends BaseDateParser {
    private readonly lunarRegex;
    private readonly specialDateRegex;
    private readonly tokenNextRegex;
    private readonly tokenLastRegex;
    private readonly monthMaxDays;
    constructor();
    parse(extractorResult: ExtractResult, referenceDate?: Date): DateTimeParseResult | null;
    private parseLunarCalendar(source);
    protected parseBasicRegexMatch(source: string, referenceDate: Date): DateTimeResolutionResult;
    protected parseImplicitDate(source: string, referenceDate: Date): DateTimeResolutionResult;
    protected matchToDate(match: Match, referenceDate: Date): DateTimeResolutionResult;
    private convertChineseYearToNumber(source);
    private getMonthOfYear(source);
    private getDayOfMonth(source);
}
