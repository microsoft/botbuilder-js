import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { IDateTimeParser, DateTimeParseResult } from "./parsers";
import { BaseDurationParser } from "./baseDuration";
import { BaseTimeParser } from "./baseTime";
import { BaseDateParser } from "./baseDate";
import { BaseDatePeriodParser } from "./baseDatePeriod";
import { BaseTimePeriodParser } from "./baseTimePeriod";
import { IDateTimeExtractor, BaseDateTimeParser } from "./baseDateTime";
import { BaseDateTimePeriodParser } from "./baseDateTimePeriod";
import { Token, DateTimeResolutionResult } from "./utilities";
export interface ISetExtractorConfiguration {
    lastRegex: RegExp;
    eachPrefixRegex: RegExp;
    periodicRegex: RegExp;
    eachUnitRegex: RegExp;
    eachDayRegex: RegExp;
    beforeEachDayRegex: RegExp;
    setWeekDayRegex: RegExp;
    setEachRegex: RegExp;
    durationExtractor: IDateTimeExtractor;
    timeExtractor: IDateTimeExtractor;
    dateExtractor: IDateTimeExtractor;
    dateTimeExtractor: IDateTimeExtractor;
    datePeriodExtractor: IDateTimeExtractor;
    timePeriodExtractor: IDateTimeExtractor;
    dateTimePeriodExtractor: IDateTimeExtractor;
}
export declare class BaseSetExtractor implements IDateTimeExtractor {
    protected readonly extractorName: string;
    protected readonly config: ISetExtractorConfiguration;
    constructor(config: ISetExtractorConfiguration);
    extract(source: string, refDate: Date): Array<ExtractResult>;
    protected matchEachUnit(source: string): Array<Token>;
    protected matchPeriodic(source: string): Array<Token>;
    protected matchEachDuration(source: string, refDate: Date): Array<Token>;
    protected timeEveryday(source: string, refDate: Date): Array<Token>;
    private matchEach(extractor, source, refDate);
}
export interface ISetParserConfiguration {
    durationExtractor: IDateTimeExtractor;
    durationParser: BaseDurationParser;
    timeExtractor: IDateTimeExtractor;
    timeParser: BaseTimeParser;
    dateExtractor: IDateTimeExtractor;
    dateParser: BaseDateParser;
    dateTimeExtractor: IDateTimeExtractor;
    dateTimeParser: BaseDateTimeParser;
    datePeriodExtractor: IDateTimeExtractor;
    datePeriodParser: BaseDatePeriodParser;
    timePeriodExtractor: IDateTimeExtractor;
    timePeriodParser: BaseTimePeriodParser;
    dateTimePeriodExtractor: IDateTimeExtractor;
    dateTimePeriodParser: BaseDateTimePeriodParser;
    unitMap: ReadonlyMap<string, string>;
    eachPrefixRegex: RegExp;
    periodicRegex: RegExp;
    eachUnitRegex: RegExp;
    eachDayRegex: RegExp;
    setWeekDayRegex: RegExp;
    setEachRegex: RegExp;
    getMatchedDailyTimex(text: string): {
        matched: boolean;
        timex: string;
    };
    getMatchedUnitTimex(text: string): {
        matched: boolean;
        timex: string;
    };
}
export declare class BaseSetParser implements IDateTimeParser {
    static readonly ParserName: string;
    protected readonly config: ISetParserConfiguration;
    constructor(configuration: ISetParserConfiguration);
    parse(er: ExtractResult, referenceDate?: Date): DateTimeParseResult | null;
    protected parseEachDuration(text: string, refDate: Date): DateTimeResolutionResult;
    protected parseEachUnit(text: string): DateTimeResolutionResult;
    protected parserTimeEveryday(text: string, refDate: Date): DateTimeResolutionResult;
    protected parseEach(extractor: IDateTimeExtractor, parser: IDateTimeParser, text: string, refDate: Date): DateTimeResolutionResult;
}
