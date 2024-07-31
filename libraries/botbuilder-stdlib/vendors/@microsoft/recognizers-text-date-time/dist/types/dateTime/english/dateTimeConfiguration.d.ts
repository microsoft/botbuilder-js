import { IDateTimeExtractor, IDateTimeExtractorConfiguration, IDateTimeParserConfiguration } from "../baseDateTime";
import { BaseDateParser } from "../baseDate";
import { BaseTimeParser } from "../baseTime";
import { BaseNumberExtractor, BaseNumberParser } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { ICommonDateTimeParserConfiguration, IDateTimeParser } from "../parsers";
import { IDateTimeUtilityConfiguration } from "../utilities";
export declare class EnglishDateTimeExtractorConfiguration implements IDateTimeExtractorConfiguration {
    readonly datePointExtractor: IDateTimeExtractor;
    readonly timePointExtractor: IDateTimeExtractor;
    readonly durationExtractor: IDateTimeExtractor;
    readonly suffixRegex: RegExp;
    readonly nowRegex: RegExp;
    readonly timeOfTodayAfterRegex: RegExp;
    readonly simpleTimeOfTodayAfterRegex: RegExp;
    readonly nightRegex: RegExp;
    readonly timeOfTodayBeforeRegex: RegExp;
    readonly simpleTimeOfTodayBeforeRegex: RegExp;
    readonly theEndOfRegex: RegExp;
    readonly unitRegex: RegExp;
    readonly prepositionRegex: RegExp;
    readonly connectorRegex: RegExp;
    readonly utilityConfiguration: IDateTimeUtilityConfiguration;
    constructor();
    isConnectorToken(source: string): boolean;
}
export declare class EnglishDateTimeParserConfiguration implements IDateTimeParserConfiguration {
    tokenBeforeDate: string;
    tokenBeforeTime: string;
    dateExtractor: IDateTimeExtractor;
    timeExtractor: IDateTimeExtractor;
    dateParser: BaseDateParser;
    timeParser: BaseTimeParser;
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
    utilityConfiguration: IDateTimeUtilityConfiguration;
    constructor(config: ICommonDateTimeParserConfiguration);
    getHour(text: string, hour: number): number;
    getMatchedNowTimex(text: string): {
        matched: boolean;
        timex: string;
    };
    getSwiftDay(text: string): number;
    haveAmbiguousToken(text: string, matchedText: string): boolean;
}
