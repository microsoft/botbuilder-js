import { BaseNumberExtractor } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { IMergedExtractorConfiguration, IMergedParserConfiguration } from "../baseMerged";
import { BaseDateParser } from "../baseDate";
import { BaseTimeParser } from "../baseTime";
import { BaseDateTimeParser, IDateTimeExtractor } from "../baseDateTime";
import { BaseDatePeriodParser } from "../baseDatePeriod";
import { BaseTimePeriodParser } from "../baseTimePeriod";
import { BaseDateTimePeriodParser } from "../baseDateTimePeriod";
import { BaseHolidayParser } from "../baseHoliday";
import { BaseDurationParser } from "../baseDuration";
import { BaseSetParser } from "../baseSet";
import { SpanishCommonDateTimeParserConfiguration } from "./baseConfiguration";
export declare class SpanishMergedExtractorConfiguration implements IMergedExtractorConfiguration {
    readonly dateExtractor: IDateTimeExtractor;
    readonly timeExtractor: IDateTimeExtractor;
    readonly dateTimeExtractor: IDateTimeExtractor;
    readonly datePeriodExtractor: IDateTimeExtractor;
    readonly timePeriodExtractor: IDateTimeExtractor;
    readonly dateTimePeriodExtractor: IDateTimeExtractor;
    readonly holidayExtractor: IDateTimeExtractor;
    readonly durationExtractor: IDateTimeExtractor;
    readonly setExtractor: IDateTimeExtractor;
    readonly integerExtractor: BaseNumberExtractor;
    readonly afterRegex: RegExp;
    readonly beforeRegex: RegExp;
    readonly sinceRegex: RegExp;
    readonly fromToRegex: RegExp;
    readonly singleAmbiguousMonthRegex: RegExp;
    readonly prepositionSuffixRegex: RegExp;
    readonly numberEndingPattern: RegExp;
    readonly filterWordRegexList: RegExp[];
    constructor();
}
export declare class SpanishMergedParserConfiguration extends SpanishCommonDateTimeParserConfiguration implements IMergedParserConfiguration {
    readonly beforeRegex: RegExp;
    readonly afterRegex: RegExp;
    readonly sinceRegex: RegExp;
    readonly dateParser: BaseDateParser;
    readonly holidayParser: BaseHolidayParser;
    readonly timeParser: BaseTimeParser;
    readonly dateTimeParser: BaseDateTimeParser;
    readonly datePeriodParser: BaseDatePeriodParser;
    readonly timePeriodParser: BaseTimePeriodParser;
    readonly dateTimePeriodParser: BaseDateTimePeriodParser;
    readonly durationParser: BaseDurationParser;
    readonly setParser: BaseSetParser;
    constructor();
}
