import { ExtractResult, Match } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseNumberExtractor, BaseNumberParser } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { Token, DateTimeResolutionResult, IDateTimeUtilityConfiguration } from "./utilities";
import { IDateTimeExtractor } from "./baseDateTime";
import { IDateTimeParser, DateTimeParseResult } from "./parsers";
export interface IDateExtractorConfiguration {
    dateRegexList: RegExp[];
    implicitDateList: RegExp[];
    monthEnd: RegExp;
    ofMonth: RegExp;
    dateUnitRegex: RegExp;
    forTheRegex: RegExp;
    weekDayAndDayOfMonthRegex: RegExp;
    relativeMonthRegex: RegExp;
    weekDayRegex: RegExp;
    dayOfWeek: ReadonlyMap<string, number>;
    ordinalExtractor: BaseNumberExtractor;
    integerExtractor: BaseNumberExtractor;
    numberParser: BaseNumberParser;
    durationExtractor: IDateTimeExtractor;
    utilityConfiguration: IDateTimeUtilityConfiguration;
}
export declare class BaseDateExtractor implements IDateTimeExtractor {
    protected readonly extractorName: string;
    protected readonly config: IDateExtractorConfiguration;
    constructor(config: IDateExtractorConfiguration);
    extract(source: string, refDate: Date): Array<ExtractResult>;
    protected basicRegexMatch(source: string): Array<Token>;
    protected implicitDate(source: string): Array<Token>;
    private numberWithMonth(source, refDate);
    protected durationWithBeforeAndAfter(source: string, refDate: Date): Array<Token>;
}
export interface IDateParserConfiguration {
    ordinalExtractor: BaseNumberExtractor;
    integerExtractor: BaseNumberExtractor;
    cardinalExtractor: BaseNumberExtractor;
    durationExtractor: IDateTimeExtractor;
    durationParser: IDateTimeParser;
    numberParser: BaseNumberParser;
    monthOfYear: ReadonlyMap<string, number>;
    dayOfMonth: ReadonlyMap<string, number>;
    dayOfWeek: ReadonlyMap<string, number>;
    unitMap: ReadonlyMap<string, string>;
    cardinalMap: ReadonlyMap<string, number>;
    dateRegex: RegExp[];
    onRegex: RegExp;
    specialDayRegex: RegExp;
    specialDayWithNumRegex: RegExp;
    nextRegex: RegExp;
    unitRegex: RegExp;
    monthRegex: RegExp;
    weekDayRegex: RegExp;
    lastRegex: RegExp;
    thisRegex: RegExp;
    weekDayOfMonthRegex: RegExp;
    forTheRegex: RegExp;
    weekDayAndDayOfMonthRegex: RegExp;
    relativeMonthRegex: RegExp;
    relativeWeekDayRegex: RegExp;
    utilityConfiguration: IDateTimeUtilityConfiguration;
    dateTokenPrefix: string;
    getSwiftDay(source: string): number;
    getSwiftMonth(source: string): number;
    isCardinalLast(source: string): boolean;
}
export declare class BaseDateParser implements IDateTimeParser {
    protected readonly parserName: string;
    protected readonly config: IDateParserConfiguration;
    constructor(config: IDateParserConfiguration);
    parse(extractorResult: ExtractResult, referenceDate?: Date): DateTimeParseResult | null;
    protected parseBasicRegexMatch(source: string, referenceDate: Date): DateTimeResolutionResult;
    protected parseImplicitDate(source: string, referenceDate: Date): DateTimeResolutionResult;
    private parseNumberWithMonth(source, referenceDate);
    private parseSingleNumber(source, referenceDate);
    protected parserDurationWithAgoAndLater(source: string, referenceDate: Date): DateTimeResolutionResult;
    protected parseWeekdayOfMonth(source: string, referenceDate: Date): DateTimeResolutionResult;
    protected matchToDate(match: Match, referenceDate: Date): DateTimeResolutionResult;
    private computeDate(cardinal, weekday, month, year);
}
