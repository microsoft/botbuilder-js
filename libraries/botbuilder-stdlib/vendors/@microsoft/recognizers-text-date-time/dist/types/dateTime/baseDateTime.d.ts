import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseNumberExtractor, BaseNumberParser } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { IDateTimeParser, DateTimeParseResult } from "./parsers";
import { Token, IDateTimeUtilityConfiguration, DateTimeResolutionResult } from "./utilities";
export interface IDateTimeExtractor {
    extract(input: string, refDate?: Date): Array<ExtractResult>;
}
export interface IDateTimeExtractorConfiguration {
    datePointExtractor: IDateTimeExtractor;
    timePointExtractor: IDateTimeExtractor;
    durationExtractor: IDateTimeExtractor;
    suffixRegex: RegExp;
    nowRegex: RegExp;
    timeOfTodayAfterRegex: RegExp;
    simpleTimeOfTodayAfterRegex: RegExp;
    nightRegex: RegExp;
    timeOfTodayBeforeRegex: RegExp;
    simpleTimeOfTodayBeforeRegex: RegExp;
    theEndOfRegex: RegExp;
    unitRegex: RegExp;
    utilityConfiguration: IDateTimeUtilityConfiguration;
    isConnectorToken(source: string): boolean;
}
export declare class BaseDateTimeExtractor implements IDateTimeExtractor {
    protected readonly extractorName: string;
    protected readonly config: IDateTimeExtractorConfiguration;
    constructor(config: IDateTimeExtractorConfiguration);
    extract(source: string, refDate: Date): Array<ExtractResult>;
    protected mergeDateAndTime(source: string, refDate: Date): Array<Token>;
    protected basicRegexMatch(source: string): Array<Token>;
    private timeOfTodayBefore(source, refDate);
    private timeOfTodayAfter(source, refDate);
    private specialTimeOfDate(source, refDate);
    private durationWithBeforeAndAfter(source, refDate);
}
export interface IDateTimeParserConfiguration {
    tokenBeforeDate: string;
    tokenBeforeTime: string;
    dateExtractor: IDateTimeExtractor;
    timeExtractor: IDateTimeExtractor;
    dateParser: IDateTimeParser;
    timeParser: IDateTimeParser;
    cardinalExtractor: BaseNumberExtractor;
    numberParser: BaseNumberParser;
    durationExtractor: IDateTimeExtractor;
    durationParser: IDateTimeParser;
    nowRegex: RegExp;
    amTimeRegex: RegExp;
    pmTimeRegex: RegExp;
    simpleTimeOfTodayAfterRegex: RegExp;
    simpleTimeOfTodayBeforeRegex: RegExp;
    specificTimeOfDayRegex: RegExp;
    theEndOfRegex: RegExp;
    unitRegex: RegExp;
    unitMap: ReadonlyMap<string, string>;
    numbers: ReadonlyMap<string, number>;
    haveAmbiguousToken(text: string, matchedText: string): boolean;
    getMatchedNowTimex(text: string): {
        matched: boolean;
        timex: string;
    };
    getSwiftDay(text: string): number;
    getHour(text: string, hour: number): number;
    utilityConfiguration: IDateTimeUtilityConfiguration;
}
export declare class BaseDateTimeParser implements IDateTimeParser {
    static readonly ParserName: string;
    protected readonly config: IDateTimeParserConfiguration;
    constructor(configuration: IDateTimeParserConfiguration);
    parse(er: ExtractResult, refTime: Date): DateTimeParseResult;
    protected parseBasicRegex(text: string, referenceTime: Date): DateTimeResolutionResult;
    protected mergeDateAndTime(text: string, referenceTime: Date): DateTimeResolutionResult;
    protected parseTimeOfToday(text: string, referenceTime: Date): DateTimeResolutionResult;
    private parseSpecialTimeOfDate(text, refDateTime);
    private parserDurationWithAgoAndLater(text, referenceTime);
}
