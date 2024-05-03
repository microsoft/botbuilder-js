import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { IDateTimeParser, DateTimeParseResult } from "../dateTime/parsers";
import { IDateTimeExtractor } from "./baseDateTime";
export declare class Token {
    constructor(start: number, end: number);
    start: number;
    end: number;
    readonly length: number;
    static mergeAllTokens(tokens: Token[], source: string, extractorName: string): Array<ExtractResult>;
}
export interface IDateTimeUtilityConfiguration {
    agoRegex: RegExp;
    laterRegex: RegExp;
    inConnectorRegex: RegExp;
    rangeUnitRegex: RegExp;
    amDescRegex: RegExp;
    pmDescRegex: RegExp;
    amPmDescRegex: RegExp;
}
export declare enum AgoLaterMode {
    Date = 0,
    DateTime = 1,
}
export declare class AgoLaterUtil {
    static extractorDurationWithBeforeAndAfter(source: string, er: ExtractResult, ret: Token[], config: IDateTimeUtilityConfiguration): Array<Token>;
    static parseDurationWithAgoAndLater(source: string, referenceDate: Date, durationExtractor: IDateTimeExtractor, durationParser: IDateTimeParser, unitMap: ReadonlyMap<string, string>, unitRegex: RegExp, utilityConfiguration: IDateTimeUtilityConfiguration, mode: AgoLaterMode): DateTimeResolutionResult;
    static getAgoLaterResult(durationParseResult: DateTimeParseResult, num: number, unitMap: ReadonlyMap<string, string>, srcUnit: string, afterStr: string, beforeStr: string, referenceDate: Date, utilityConfiguration: IDateTimeUtilityConfiguration, mode: AgoLaterMode): DateTimeResolutionResult;
    static getDateResult(unitStr: string, num: number, referenceDate: Date, isFuture: boolean, mode: AgoLaterMode): DateTimeResolutionResult;
}
export interface MatchedIndex {
    matched: boolean;
    index: number;
}
export declare class MatchingUtil {
    static getAgoLaterIndex(source: string, regex: RegExp): MatchedIndex;
    static getInIndex(source: string, regex: RegExp): MatchedIndex;
    static containsAgoLaterIndex(source: string, regex: RegExp): boolean;
    static containsInIndex(source: string, regex: RegExp): boolean;
}
export declare class FormatUtil {
    static readonly HourTimexRegex: RegExp;
    static toString(num: number, size: number): string;
    static luisDate(year: number, month: number, day: number): string;
    static luisDateFromDate(date: Date): string;
    static luisTime(hour: number, min: number, second: number): string;
    static luisTimeFromDate(time: Date): string;
    static luisDateTime(time: Date): string;
    static formatDate(date: Date): string;
    static formatTime(time: Date): string;
    static formatDateTime(datetime: Date): string;
    static shortTime(hour: number, minute: number, second: number): string;
    static luisTimeSpan(from: Date, to: Date): string;
    static allStringToPm(timeStr: string): string;
    static toPm(timeStr: string): string;
}
export declare class StringMap {
    [key: string]: string;
}
export declare class DateTimeResolutionResult {
    success: boolean;
    timex: string;
    isLunar: boolean;
    mod: string;
    comment: string;
    futureResolution: StringMap;
    pastResolution: StringMap;
    futureValue: any;
    pastValue: any;
    subDateTimeEntities: Array<any>;
    constructor();
}
export declare enum DayOfWeek {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
}
export declare class DateUtils {
    private static readonly oneDay;
    private static readonly oneHour;
    private static readonly oneMinute;
    private static readonly oneSecond;
    static next(from: Date, dayOfWeek: DayOfWeek): Date;
    static this(from: Date, dayOfWeek: DayOfWeek): Date;
    static last(from: Date, dayOfWeek: DayOfWeek): Date;
    static diffDays(from: Date, to: Date): number;
    static totalHours(from: Date, to: Date): number;
    static totalHoursFloor(from: Date, to: Date): number;
    static totalMinutesFloor(from: Date, to: Date): number;
    static totalSeconds(from: Date, to: Date): number;
    static addTime(seedDate: Date, timeToAdd: Date): Date;
    static addSeconds(seedDate: Date, secondsToAdd: number): Date;
    static addMinutes(seedDate: Date, minutesToAdd: number): Date;
    static addHours(seedDate: Date, hoursToAdd: number): Date;
    static addDays(seedDate: Date, daysToAdd: number): Date;
    static addMonths(seedDate: Date, monthsToAdd: number): Date;
    static addYears(seedDate: Date, yearsToAdd: number): Date;
    static getWeekNumber(referenceDate: Date): {
        weekNo: number;
        year: number;
    };
    static minValue(): Date;
    static safeCreateFromValue(seedDate: Date, year: number, month: number, day: number, hour?: number, minute?: number, second?: number): Date;
    static safeCreateFromMinValue(year: number, month: number, day: number, hour?: number, minute?: number, second?: number): Date;
    static safeCreateDateResolveOverflow(year: number, month: number, day: number): Date;
    static safeCreateFromMinValueWithDateAndTime(date: Date, time?: Date): Date;
    static isLeapYear(year: number): boolean;
    static dayOfYear(date: Date): number;
    private static validDays(year);
    private static isValidDate(year, month, day);
    private static isValidTime(hour, minute, second);
}
