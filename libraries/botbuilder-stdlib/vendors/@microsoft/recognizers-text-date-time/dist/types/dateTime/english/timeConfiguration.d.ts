import { ITimeExtractorConfiguration, ITimeParserConfiguration } from "../baseTime";
import { ICommonDateTimeParserConfiguration } from "../parsers";
import { IDateTimeUtilityConfiguration } from "../utilities";
export declare class EnglishTimeExtractorConfiguration implements ITimeExtractorConfiguration {
    static timeRegexList: RegExp[];
    static atRegex: RegExp;
    static lessThanOneHour: RegExp;
    static timeSuffix: RegExp;
    static timeSuffixFull: RegExp;
    static ishRegex: RegExp;
    readonly timeRegexList: RegExp[];
    readonly atRegex: RegExp;
    readonly ishRegex: RegExp;
    constructor();
}
export declare class EnglishTimeParserConfiguration implements ITimeParserConfiguration {
    readonly timeTokenPrefix: string;
    readonly atRegex: RegExp;
    readonly timeRegexes: RegExp[];
    readonly numbers: ReadonlyMap<string, number>;
    readonly lunchRegex: RegExp;
    readonly timeSuffixFull: RegExp;
    readonly nightRegex: RegExp;
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
