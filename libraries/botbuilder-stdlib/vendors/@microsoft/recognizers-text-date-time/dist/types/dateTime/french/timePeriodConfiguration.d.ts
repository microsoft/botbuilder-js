import { IExtractor } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { ITimePeriodExtractorConfiguration, ITimePeriodParserConfiguration } from "../baseTimePeriod";
import { BaseTimeParser } from "../baseTime";
import { IDateTimeUtilityConfiguration } from "../utilities";
import { FrenchDateTimeUtilityConfiguration } from "./baseConfiguration";
import { ICommonDateTimeParserConfiguration } from "../parsers";
import { IDateTimeExtractor } from "../baseDateTime";
export declare class FrenchTimePeriodExtractorConfiguration implements ITimePeriodExtractorConfiguration {
    readonly simpleCasesRegex: RegExp[];
    readonly tillRegex: RegExp;
    readonly timeOfDayRegex: RegExp;
    readonly generalEndingRegex: RegExp;
    readonly singleTimeExtractor: IDateTimeExtractor;
    readonly integerExtractor: IExtractor;
    readonly utilityConfiguration: FrenchDateTimeUtilityConfiguration;
    readonly fromRegex: RegExp;
    readonly connectorAndRegex: RegExp;
    readonly beforeRegex: RegExp;
    constructor();
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
export declare class FrenchTimePeriodParserConfiguration implements ITimePeriodParserConfiguration {
    readonly timeExtractor: IDateTimeExtractor;
    readonly timeParser: BaseTimeParser;
    readonly integerExtractor: IExtractor;
    readonly pureNumberFromToRegex: RegExp;
    readonly pureNumberBetweenAndRegex: RegExp;
    readonly timeOfDayRegex: RegExp;
    readonly tillRegex: RegExp;
    readonly numbers: ReadonlyMap<string, number>;
    readonly utilityConfiguration: IDateTimeUtilityConfiguration;
    readonly specificTimeFromToRegex: RegExp;
    readonly specificTimeBetweenAndRegex: RegExp;
    constructor(config: ICommonDateTimeParserConfiguration);
    getMatchedTimexRange(text: string): {
        matched: boolean;
        timex: string;
        beginHour: number;
        endHour: number;
        endMin: number;
    };
}
