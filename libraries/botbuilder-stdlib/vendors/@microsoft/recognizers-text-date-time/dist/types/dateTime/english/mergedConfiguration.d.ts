import { IMergedExtractorConfiguration, IMergedParserConfiguration } from "../baseMerged";
import { BaseDateParser } from "../baseDate";
import { BaseTimeParser } from "../baseTime";
import { BaseSetParser } from "../baseSet";
import { BaseHolidayParser } from "../baseHoliday";
import { BaseDatePeriodParser } from "../baseDatePeriod";
import { BaseTimePeriodParser } from "../baseTimePeriod";
import { IDateTimeExtractor, BaseDateTimeParser } from "../baseDateTime";
import { BaseDateTimePeriodParser } from "../baseDateTimePeriod";
import { BaseDurationParser } from "../baseDuration";
import { BaseNumberExtractor } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { EnglishCommonDateTimeParserConfiguration } from "./baseConfiguration";
export declare class EnglishMergedExtractorConfiguration implements IMergedExtractorConfiguration {
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
    readonly sinceRegex: RegExp;
    readonly beforeRegex: RegExp;
    readonly fromToRegex: RegExp;
    readonly singleAmbiguousMonthRegex: RegExp;
    readonly prepositionSuffixRegex: RegExp;
    readonly numberEndingPattern: RegExp;
    readonly filterWordRegexList: RegExp[];
    constructor();
}
export declare class EnglishMergedParserConfiguration implements IMergedParserConfiguration {
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
    constructor(config: EnglishCommonDateTimeParserConfiguration);
}
