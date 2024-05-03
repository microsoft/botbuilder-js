import { ITimeExtractorConfiguration, ITimeParserConfiguration } from "../baseTime";
import { ICommonDateTimeParserConfiguration } from "../parsers";
import { IDateTimeUtilityConfiguration } from "../utilities";
import { IDateTimeExtractor } from "../baseDateTime";
export declare class SpanishTimeExtractorConfiguration implements ITimeExtractorConfiguration {
    readonly timeRegexList: RegExp[];
    readonly atRegex: RegExp;
    readonly ishRegex: RegExp;
    readonly durationExtractor: IDateTimeExtractor;
    constructor();
    static getTimeRegexList(): RegExp[];
}
export declare class SpanishTimeParserConfiguration implements ITimeParserConfiguration {
    readonly timeTokenPrefix: string;
    readonly atRegex: RegExp;
    readonly timeRegexes: RegExp[];
    readonly lessThanOneHour: RegExp;
    readonly timeSuffix: RegExp;
    readonly numbers: ReadonlyMap<string, number>;
    readonly utilityConfiguration: IDateTimeUtilityConfiguration;
    constructor(config: ICommonDateTimeParserConfiguration);
    adjustByPrefix(prefix: string, adjust: {
        hour: number;
        min: number;
        hasMin: boolean;
    }): void;
    adjustBySuffix(suffix: string, adjust: {
        hour: number;
        min: number;
        hasMin: boolean;
        hasAm: boolean;
        hasPm: boolean;
    }): void;
}
