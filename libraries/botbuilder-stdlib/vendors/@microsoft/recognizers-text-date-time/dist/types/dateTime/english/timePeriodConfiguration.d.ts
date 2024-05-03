import { ITimePeriodExtractorConfiguration, ITimePeriodParserConfiguration } from "../baseTimePeriod";
import { BaseTimeParser } from "../baseTime";
import { IExtractor } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { ICommonDateTimeParserConfiguration } from "../parsers";
import { IDateTimeUtilityConfiguration } from "../utilities";
import { IDateTimeExtractor } from "../baseDateTime";
export declare class EnglishTimePeriodExtractorConfiguration implements ITimePeriodExtractorConfiguration {
    readonly simpleCasesRegex: RegExp[];
    readonly tillRegex: RegExp;
    readonly timeOfDayRegex: RegExp;
    readonly generalEndingRegex: RegExp;
    readonly singleTimeExtractor: IDateTimeExtractor;
    readonly integerExtractor: IExtractor;
    constructor();
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
export declare class EnglishTimePeriodParserConfiguration implements ITimePeriodParserConfiguration {
    timeExtractor: IDateTimeExtractor;
    timeParser: BaseTimeParser;
    integerExtractor: IDateTimeExtractor;
    pureNumberFromToRegex: RegExp;
    pureNumberBetweenAndRegex: RegExp;
    timeOfDayRegex: RegExp;
    tillRegex: RegExp;
    numbers: ReadonlyMap<string, number>;
    utilityConfiguration: IDateTimeUtilityConfiguration;
    specificTimeFromToRegex: RegExp;
    specificTimeBetweenAndRegex: RegExp;
    constructor(config: ICommonDateTimeParserConfiguration);
    getMatchedTimexRange(text: string): {
        matched: boolean;
        timex: string;
        beginHour: number;
        endHour: number;
        endMin: number;
    };
}
