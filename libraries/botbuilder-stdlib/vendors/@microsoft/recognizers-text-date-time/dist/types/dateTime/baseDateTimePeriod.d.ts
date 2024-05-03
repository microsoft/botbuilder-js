import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseNumberExtractor } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { BaseDateParser } from "./baseDate";
import { BaseTimeParser } from "./baseTime";
import { BaseDateTimeParser, IDateTimeExtractor } from "./baseDateTime";
import { BaseDurationParser } from "./baseDuration";
import { IDateTimeParser, DateTimeParseResult } from "./parsers";
import { Token, DateTimeResolutionResult } from "./utilities";
export interface IDateTimePeriodExtractorConfiguration {
    cardinalExtractor: BaseNumberExtractor;
    singleDateExtractor: IDateTimeExtractor;
    singleTimeExtractor: IDateTimeExtractor;
    singleDateTimeExtractor: IDateTimeExtractor;
    durationExtractor: IDateTimeExtractor;
    timePeriodExtractor: IDateTimeExtractor;
    simpleCasesRegexes: RegExp[];
    prepositionRegex: RegExp;
    tillRegex: RegExp;
    specificTimeOfDayRegex: RegExp;
    timeOfDayRegex: RegExp;
    periodTimeOfDayWithDateRegex: RegExp;
    followedUnit: RegExp;
    numberCombinedWithUnit: RegExp;
    timeUnitRegex: RegExp;
    pastPrefixRegex: RegExp;
    nextPrefixRegex: RegExp;
    relativeTimeUnitRegex: RegExp;
    restOfDateTimeRegex: RegExp;
    generalEndingRegex: RegExp;
    middlePauseRegex: RegExp;
    getFromTokenIndex(source: string): {
        matched: boolean;
        index: number;
    };
    getBetweenTokenIndex(source: string): {
        matched: boolean;
        index: number;
    };
    hasConnectorToken(source: string): boolean;
}
export declare class BaseDateTimePeriodExtractor implements IDateTimeExtractor {
    protected readonly extractorName: string;
    protected readonly config: IDateTimePeriodExtractorConfiguration;
    constructor(config: IDateTimePeriodExtractorConfiguration);
    extract(source: string, refDate: Date): Array<ExtractResult>;
    private matchSimpleCases(source, refDate);
    protected mergeTwoTimePoints(source: string, refDate: Date): Array<Token>;
    private matchDuration(source, refDate);
    protected matchNight(source: string, refDate: Date): Array<Token>;
    private matchRelativeUnit(source);
}
export interface IDateTimePeriodParserConfiguration {
    pureNumberFromToRegex: RegExp;
    pureNumberBetweenAndRegex: RegExp;
    periodTimeOfDayWithDateRegex: RegExp;
    specificTimeOfDayRegex: RegExp;
    pastRegex: RegExp;
    futureRegex: RegExp;
    relativeTimeUnitRegex: RegExp;
    restOfDateTimeRegex: RegExp;
    numbers: ReadonlyMap<string, number>;
    unitMap: ReadonlyMap<string, string>;
    dateExtractor: IDateTimeExtractor;
    timeExtractor: IDateTimeExtractor;
    dateTimeExtractor: IDateTimeExtractor;
    timePeriodExtractor: IDateTimeExtractor;
    durationExtractor: IDateTimeExtractor;
    dateParser: BaseDateParser;
    timeParser: BaseTimeParser;
    dateTimeParser: BaseDateTimeParser;
    timePeriodParser: IDateTimeParser;
    durationParser: BaseDurationParser;
    getMatchedTimeRange(source: string): {
        timeStr: string;
        beginHour: number;
        endHour: number;
        endMin: number;
        success: boolean;
    };
    getSwiftPrefix(source: string): number;
}
export declare class BaseDateTimePeriodParser implements IDateTimeParser {
    protected readonly parserName: string;
    protected readonly config: IDateTimePeriodParserConfiguration;
    constructor(config: IDateTimePeriodParserConfiguration);
    parse(extractorResult: ExtractResult, referenceDate?: Date): DateTimeParseResult | null;
    protected mergeDateAndTimePeriods(text: string, referenceTime: Date): DateTimeResolutionResult;
    private parseSimpleCases(source, referenceDate);
    protected mergeTwoTimePoints(source: string, referenceDate: Date): DateTimeResolutionResult;
    protected getTwoPoints(beginEr: ExtractResult, endEr: ExtractResult, beginParser: IDateTimeParser, endParser: IDateTimeParser, referenceDate: Date): {
        begin: DateTimeParseResult;
        end: DateTimeParseResult;
    };
    protected parseSpecificTimeOfDay(source: string, referenceDate: Date): DateTimeResolutionResult;
    protected parseDuration(source: string, referenceDate: Date): DateTimeResolutionResult;
    private isFloat(value);
    private parseRelativeUnit(source, referenceDate);
}
