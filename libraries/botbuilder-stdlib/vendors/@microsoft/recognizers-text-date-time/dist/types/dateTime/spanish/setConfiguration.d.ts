import { ISetExtractorConfiguration, ISetParserConfiguration } from "../baseSet";
import { BaseDurationParser } from "../baseDuration";
import { BaseTimeParser } from "../baseTime";
import { BaseDateParser } from "../baseDate";
import { BaseDateTimeParser, IDateTimeExtractor } from "../baseDateTime";
import { BaseDatePeriodParser } from "../baseDatePeriod";
import { BaseTimePeriodParser } from "../baseTimePeriod";
import { BaseDateTimePeriodParser } from "../baseDateTimePeriod";
import { ICommonDateTimeParserConfiguration } from "../parsers";
export declare class SpanishSetExtractorConfiguration implements ISetExtractorConfiguration {
    readonly lastRegex: RegExp;
    readonly eachPrefixRegex: RegExp;
    readonly periodicRegex: RegExp;
    readonly eachUnitRegex: RegExp;
    readonly eachDayRegex: RegExp;
    readonly beforeEachDayRegex: RegExp;
    readonly setWeekDayRegex: RegExp;
    readonly setEachRegex: RegExp;
    readonly durationExtractor: IDateTimeExtractor;
    readonly timeExtractor: IDateTimeExtractor;
    readonly dateExtractor: IDateTimeExtractor;
    readonly dateTimeExtractor: IDateTimeExtractor;
    readonly datePeriodExtractor: IDateTimeExtractor;
    readonly timePeriodExtractor: IDateTimeExtractor;
    readonly dateTimePeriodExtractor: IDateTimeExtractor;
    constructor();
}
export declare class SpanishSetParserConfiguration implements ISetParserConfiguration {
    readonly durationExtractor: IDateTimeExtractor;
    readonly durationParser: BaseDurationParser;
    readonly timeExtractor: IDateTimeExtractor;
    readonly timeParser: BaseTimeParser;
    readonly dateExtractor: IDateTimeExtractor;
    readonly dateParser: BaseDateParser;
    readonly dateTimeExtractor: IDateTimeExtractor;
    readonly dateTimeParser: BaseDateTimeParser;
    readonly datePeriodExtractor: IDateTimeExtractor;
    readonly datePeriodParser: BaseDatePeriodParser;
    readonly timePeriodExtractor: IDateTimeExtractor;
    readonly timePeriodParser: BaseTimePeriodParser;
    readonly dateTimePeriodExtractor: IDateTimeExtractor;
    readonly dateTimePeriodParser: BaseDateTimePeriodParser;
    readonly unitMap: ReadonlyMap<string, string>;
    readonly eachPrefixRegex: RegExp;
    readonly periodicRegex: RegExp;
    readonly eachUnitRegex: RegExp;
    readonly eachDayRegex: RegExp;
    readonly setWeekDayRegex: RegExp;
    readonly setEachRegex: RegExp;
    constructor(config: ICommonDateTimeParserConfiguration);
    getMatchedDailyTimex(text: string): {
        matched: boolean;
        timex: string;
    };
    getMatchedUnitTimex(text: string): {
        matched: boolean;
        timex: string;
    };
}
