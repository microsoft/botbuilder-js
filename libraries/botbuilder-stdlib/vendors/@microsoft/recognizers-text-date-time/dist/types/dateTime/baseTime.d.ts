import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { Token, DateTimeResolutionResult, IDateTimeUtilityConfiguration } from "./utilities";
import { IDateTimeParser, DateTimeParseResult } from "./parsers";
import { IDateTimeExtractor } from "./baseDateTime";
export interface ITimeExtractorConfiguration {
    timeRegexList: RegExp[];
    atRegex: RegExp;
    ishRegex: RegExp;
}
export declare class BaseTimeExtractor implements IDateTimeExtractor {
    private readonly extractorName;
    private readonly config;
    constructor(config: ITimeExtractorConfiguration);
    extract(text: string, refDate: Date): Array<ExtractResult>;
    basicRegexMatch(text: string): Array<Token>;
    atRegexMatch(text: string): Array<Token>;
    specialsRegexMatch(text: string, refDate: Date): Array<Token>;
}
export interface ITimeParserConfiguration {
    timeTokenPrefix: string;
    atRegex: RegExp;
    timeRegexes: RegExp[];
    numbers: ReadonlyMap<string, number>;
    utilityConfiguration: IDateTimeUtilityConfiguration;
    adjustByPrefix(prefix: string, adjust: {
        hour: number;
        min: number;
        hasMin: boolean;
    }): any;
    adjustBySuffix(suffix: string, adjust: {
        hour: number;
        min: number;
        hasMin: boolean;
        hasAm: boolean;
        hasPm: boolean;
    }): any;
}
export declare class BaseTimeParser implements IDateTimeParser {
    readonly ParserName: string;
    readonly config: ITimeParserConfiguration;
    constructor(configuration: ITimeParserConfiguration);
    parse(er: ExtractResult, referenceTime?: Date): DateTimeParseResult | null;
    internalParse(text: string, referenceTime: Date): DateTimeResolutionResult;
    private parseBasicRegexMatch(text, referenceTime);
    private match2Time(match, referenceTime);
}
