import { ExtractResult, Match } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseDatePeriodExtractor, BaseDatePeriodParser } from "../baseDatePeriod";
import { DateTimeResolutionResult } from "../utilities";
import { DateTimeParseResult } from "../parsers";
export declare class ChineseDatePeriodExtractor extends BaseDatePeriodExtractor {
    constructor();
    extract(source: string, refDate: Date): Array<ExtractResult>;
    private matchNumberWithUnit(source);
}
export declare class ChineseDatePeriodParser extends BaseDatePeriodParser {
    private readonly integerExtractor;
    private readonly numberParser;
    private readonly yearInChineseRegex;
    private readonly numberCombinedWithUnitRegex;
    private readonly unitRegex;
    private readonly yearAndMonthRegex;
    private readonly pureNumberYearAndMonthRegex;
    private readonly yearToYearRegex;
    private readonly YearToYearSuffixRequired;
    private readonly chineseYearRegex;
    private readonly seasonWithYearRegex;
    constructor();
    parse(extractorResult: ExtractResult, referenceDate?: Date): DateTimeParseResult | null;
    protected getMatchSimpleCase(source: string): Match;
    protected parseSimpleCases(source: string, referenceDate: Date): DateTimeResolutionResult;
    protected parseYear(source: string, referenceDate: Date): DateTimeResolutionResult;
    private convertYear(yearStr, isChinese);
    protected getWeekOfMonth(cardinal: number, month: number, year: number, referenceDate: Date, noYear: boolean): DateTimeResolutionResult;
    protected computeDate(cardinal: number, weekday: number, month: number, year: number): Date;
    protected parseSeason(source: string, referenceDate: Date): DateTimeResolutionResult;
    protected parseQuarter(source: string, referenceDate: Date): DateTimeResolutionResult;
    protected parseNumberWithUnit(source: string, referenceDate: Date): DateTimeResolutionResult;
    protected parseDuration(source: string, referenceDate: Date): DateTimeResolutionResult;
    private parseCommonDurationWithUnit(beforeStr, sourceUnit, numStr, referenceDate);
    private convertChineseToNumber(source);
    private parseYearAndMonth(source, referenceDate);
    private parseYearToYear(source, referenceDate);
    private sanitizeYear(year);
}
