import { IParser, ParseResult, ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseNumberParser, BaseNumberExtractor } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { IDateTimeUtilityConfiguration } from "./utilities";
import { BaseDateParser } from "./baseDate";
import { BaseTimeParser } from "./baseTime";
import { BaseDatePeriodParser } from "./baseDatePeriod";
import { BaseTimePeriodParser } from "./baseTimePeriod";
import { IDateTimeExtractor, BaseDateTimeParser } from "./baseDateTime";
import { BaseDateTimePeriodParser } from "./baseDateTimePeriod";
import { BaseDurationParser } from "./baseDuration";
export declare class DateTimeParseResult extends ParseResult {
    timexStr: string;
}
export interface IDateTimeParser extends IParser {
    parse(extResult: ExtractResult, referenceDate?: Date): DateTimeParseResult | null;
}
export interface ICommonDateTimeParserConfiguration {
    cardinalExtractor: BaseNumberExtractor;
    integerExtractor: BaseNumberExtractor;
    ordinalExtractor: BaseNumberExtractor;
    numberParser: BaseNumberParser;
    dateExtractor: IDateTimeExtractor;
    timeExtractor: IDateTimeExtractor;
    dateTimeExtractor: IDateTimeExtractor;
    durationExtractor: IDateTimeExtractor;
    datePeriodExtractor: IDateTimeExtractor;
    timePeriodExtractor: IDateTimeExtractor;
    dateTimePeriodExtractor: IDateTimeExtractor;
    dateParser: BaseDateParser;
    timeParser: BaseTimeParser;
    dateTimeParser: BaseDateTimeParser;
    durationParser: BaseDurationParser;
    datePeriodParser: BaseDatePeriodParser;
    timePeriodParser: BaseTimePeriodParser;
    dateTimePeriodParser: BaseDateTimePeriodParser;
    monthOfYear: ReadonlyMap<string, number>;
    numbers: ReadonlyMap<string, number>;
    unitValueMap: ReadonlyMap<string, number>;
    seasonMap: ReadonlyMap<string, string>;
    unitMap: ReadonlyMap<string, string>;
    cardinalMap: ReadonlyMap<string, number>;
    dayOfMonth: ReadonlyMap<string, number>;
    dayOfWeek: ReadonlyMap<string, number>;
    doubleNumbers: ReadonlyMap<string, number>;
    utilityConfiguration: IDateTimeUtilityConfiguration;
}
export declare abstract class BaseDateParserConfiguration implements ICommonDateTimeParserConfiguration {
    cardinalExtractor: BaseNumberExtractor;
    integerExtractor: BaseNumberExtractor;
    ordinalExtractor: BaseNumberExtractor;
    numberParser: BaseNumberParser;
    dateExtractor: IDateTimeExtractor;
    timeExtractor: IDateTimeExtractor;
    dateTimeExtractor: IDateTimeExtractor;
    durationExtractor: IDateTimeExtractor;
    datePeriodExtractor: IDateTimeExtractor;
    timePeriodExtractor: IDateTimeExtractor;
    dateTimePeriodExtractor: IDateTimeExtractor;
    dateParser: BaseDateParser;
    timeParser: BaseTimeParser;
    dateTimeParser: BaseDateTimeParser;
    durationParser: BaseDurationParser;
    datePeriodParser: BaseDatePeriodParser;
    timePeriodParser: BaseTimePeriodParser;
    dateTimePeriodParser: BaseDateTimePeriodParser;
    monthOfYear: ReadonlyMap<string, number>;
    numbers: ReadonlyMap<string, number>;
    unitValueMap: ReadonlyMap<string, number>;
    seasonMap: ReadonlyMap<string, string>;
    unitMap: ReadonlyMap<string, string>;
    cardinalMap: ReadonlyMap<string, number>;
    dayOfMonth: ReadonlyMap<string, number>;
    dayOfWeek: ReadonlyMap<string, number>;
    doubleNumbers: ReadonlyMap<string, number>;
    utilityConfiguration: IDateTimeUtilityConfiguration;
    constructor();
}
