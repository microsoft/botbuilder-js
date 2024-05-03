import { IExtractor, ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { IDateTimeUtilityConfiguration } from "./utilities";
import { IDateTimeParser, DateTimeParseResult } from "./parsers";
import { BaseTimeParser } from "./baseTime";
import { IDateTimeExtractor } from "./baseDateTime";
export interface ITimePeriodExtractorConfiguration {
    simpleCasesRegex: RegExp[];
    tillRegex: RegExp;
    timeOfDayRegex: RegExp;
    generalEndingRegex: RegExp;
    singleTimeExtractor: IDateTimeExtractor;
    integerExtractor: IExtractor;
    getFromTokenIndex(text: string): {
        matched: boolean;
        index: number;
    };
    hasConnectorToken(text: string): boolean;
    getBetweenTokenIndex(text: string): {
        matched: boolean;
        index: number;
    };
}
export declare class BaseTimePeriodExtractor implements IDateTimeExtractor {
    readonly extractorName: string;
    readonly config: ITimePeriodExtractorConfiguration;
    constructor(config: ITimePeriodExtractorConfiguration);
    extract(source: string, refDate: Date): Array<ExtractResult>;
    private matchSimpleCases(text);
    private mergeTwoTimePoints(text, refDate);
    private matchNight(source);
}
export interface ITimePeriodParserConfiguration {
    timeExtractor: IDateTimeExtractor;
    timeParser: BaseTimeParser;
    integerExtractor: IExtractor;
    pureNumberFromToRegex: RegExp;
    pureNumberBetweenAndRegex: RegExp;
    timeOfDayRegex: RegExp;
    tillRegex: RegExp;
    numbers: ReadonlyMap<string, number>;
    utilityConfiguration: IDateTimeUtilityConfiguration;
    specificTimeFromToRegex: RegExp;
    specificTimeBetweenAndRegex: RegExp;
    getMatchedTimexRange(text: string): {
        matched: boolean;
        timex: string;
        beginHour: number;
        endHour: number;
        endMin: number;
    };
}
export declare class BaseTimePeriodParser implements IDateTimeParser {
    static readonly ParserName: string;
    protected readonly config: ITimePeriodParserConfiguration;
    constructor(configuration: ITimePeriodParserConfiguration);
    parse(er: ExtractResult, refTime?: Date): DateTimeParseResult;
    private parseSimpleCases(source, reference);
    private parsePureNumCases(text, referenceTime);
    private parseSpecificTimeCases(source, reference);
    private mergeTwoTimePoints(text, referenceTime);
    private parseTimeOfDay(text, referenceTime);
}
