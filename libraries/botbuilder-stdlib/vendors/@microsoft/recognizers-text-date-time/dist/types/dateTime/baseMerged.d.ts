import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseNumberExtractor } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { IDateTimeParser, DateTimeParseResult } from "./parsers";
import { StringMap } from "./utilities";
import { BaseDateParser } from "./baseDate";
import { BaseTimeParser } from "./baseTime";
import { BaseDatePeriodParser } from "./baseDatePeriod";
import { BaseTimePeriodParser } from "./baseTimePeriod";
import { IDateTimeExtractor, BaseDateTimeParser } from "./baseDateTime";
import { BaseDateTimePeriodParser } from "./baseDateTimePeriod";
import { BaseSetParser } from "./baseSet";
import { BaseDurationParser } from "./baseDuration";
import { BaseHolidayParser } from "./baseHoliday";
import { DateTimeOptions } from "./dateTimeRecognizer";
export interface IMergedExtractorConfiguration {
    dateExtractor: IDateTimeExtractor;
    timeExtractor: IDateTimeExtractor;
    dateTimeExtractor: IDateTimeExtractor;
    datePeriodExtractor: IDateTimeExtractor;
    timePeriodExtractor: IDateTimeExtractor;
    dateTimePeriodExtractor: IDateTimeExtractor;
    holidayExtractor: IDateTimeExtractor;
    durationExtractor: IDateTimeExtractor;
    setExtractor: IDateTimeExtractor;
    integerExtractor: BaseNumberExtractor;
    afterRegex: RegExp;
    beforeRegex: RegExp;
    sinceRegex: RegExp;
    fromToRegex: RegExp;
    singleAmbiguousMonthRegex: RegExp;
    prepositionSuffixRegex: RegExp;
    numberEndingPattern: RegExp;
    filterWordRegexList: RegExp[];
}
export declare class BaseMergedExtractor implements IDateTimeExtractor {
    protected readonly config: IMergedExtractorConfiguration;
    protected readonly options: DateTimeOptions;
    constructor(config: IMergedExtractorConfiguration, options: DateTimeOptions);
    extract(source: string, refDate: Date): Array<ExtractResult>;
    private checkCalendarFilterList(ers, text);
    private numberEndingRegexMatch(text, extractResults);
    protected addTo(destination: ExtractResult[], source: ExtractResult[], text: string): void;
    private shouldSkipFromMerge(er);
    private filterAmbiguousSingleWord(er, text);
    protected addMod(ers: ExtractResult[], source: string): void;
    private hasTokenIndex(source, regex);
}
export interface IMergedParserConfiguration {
    beforeRegex: RegExp;
    afterRegex: RegExp;
    sinceRegex: RegExp;
    dateParser: BaseDateParser;
    holidayParser: BaseHolidayParser;
    timeParser: BaseTimeParser;
    dateTimeParser: BaseDateTimeParser;
    datePeriodParser: BaseDatePeriodParser;
    timePeriodParser: BaseTimePeriodParser;
    dateTimePeriodParser: BaseDateTimePeriodParser;
    durationParser: BaseDurationParser;
    setParser: BaseSetParser;
}
export declare class BaseMergedParser implements IDateTimeParser {
    readonly parserTypeName: string;
    protected readonly config: IMergedParserConfiguration;
    private readonly options;
    private readonly dateMinValue;
    private readonly dateTimeMinValue;
    constructor(config: IMergedParserConfiguration, options: DateTimeOptions);
    parse(er: ExtractResult, refTime?: Date): DateTimeParseResult | null;
    setParseResult(slot: DateTimeParseResult, hasBefore: boolean, hasAfter: boolean, hasSince: boolean): DateTimeParseResult;
    protected getParseResult(extractorResult: ExtractResult, referenceDate: Date): DateTimeParseResult | null;
    protected determineDateTimeType(type: string, hasBefore: boolean, hasAfter: boolean, hasSince: boolean): string;
    dateTimeResolutionForSplit(slot: DateTimeParseResult): Array<DateTimeParseResult>;
    protected dateTimeResolution(slot: DateTimeParseResult, hasBefore: boolean, hasAfter: boolean, hasSince: boolean): {
        [s: string]: Array<StringMap>;
    };
    protected isObject(o: any): boolean;
    protected addResolutionFieldsAny(dic: Map<string, any>, key: string, value: any): void;
    protected addResolutionFields(dic: StringMap, key: string, value: string): void;
    protected generateFromResolution(type: string, resolutions: StringMap, mod: string): StringMap;
    private addSingleDateTimeToResolution(resolutions, type, mod, result);
    private addPeriodToResolution(resolutions, startType, endType, mod, result);
    protected getValues(obj: any): Array<any>;
    protected resolveAMPM(valuesMap: Map<string, any>, keyName: string): void;
}
