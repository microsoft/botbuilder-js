import { ExtractResult, Match } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { DateTimeResolutionResult, DayOfWeek } from "./utilities";
import { IDateTimeParser, DateTimeParseResult } from "./parsers";
import { IDateTimeExtractor } from "./baseDateTime";
export interface IHolidayExtractorConfiguration {
    holidayRegexes: RegExp[];
}
export declare class BaseHolidayExtractor implements IDateTimeExtractor {
    private readonly extractorName;
    private readonly config;
    constructor(config: IHolidayExtractorConfiguration);
    extract(source: string, refDate: Date): Array<ExtractResult>;
    private holidayMatch(source);
}
export interface IHolidayParserConfiguration {
    variableHolidaysTimexDictionary: ReadonlyMap<string, string>;
    holidayFuncDictionary: ReadonlyMap<string, (year: number) => Date>;
    holidayNames: ReadonlyMap<string, string[]>;
    holidayRegexList: RegExp[];
    getSwiftYear(text: string): number;
    sanitizeHolidayToken(holiday: string): string;
}
export declare class BaseHolidayParser implements IDateTimeParser {
    static readonly ParserName: string;
    protected readonly config: IHolidayParserConfiguration;
    constructor(config: IHolidayParserConfiguration);
    parse(er: ExtractResult, referenceDate: Date): DateTimeParseResult;
    protected parseHolidayRegexMatch(text: string, referenceDate: Date): DateTimeResolutionResult;
    protected match2Date(match: Match, referenceDate: Date): DateTimeResolutionResult;
    private getFutureValue(value, referenceDate, holiday);
    private getPastValue(value, referenceDate, holiday);
}
export declare abstract class BaseHolidayParserConfiguration implements IHolidayParserConfiguration {
    variableHolidaysTimexDictionary: ReadonlyMap<string, string>;
    holidayFuncDictionary: ReadonlyMap<string, (year: number) => Date>;
    holidayNames: ReadonlyMap<string, string[]>;
    holidayRegexList: RegExp[];
    abstract getSwiftYear(text: string): number;
    abstract sanitizeHolidayToken(holiday: string): string;
    constructor();
    protected initHolidayFuncs(): ReadonlyMap<string, (year: number) => Date>;
    protected static MothersDay(year: number): Date;
    protected static FathersDay(year: number): Date;
    private static MartinLutherKingDay(year);
    private static WashingtonsBirthday(year);
    private static CanberraDay(year);
    protected static MemorialDay(year: number): Date;
    protected static LabourDay(year: number): Date;
    protected static ColumbusDay(year: number): Date;
    protected static ThanksgivingDay(year: number): Date;
    protected static getDay(year: number, month: number, week: number, dayOfWeek: DayOfWeek): number;
    protected static getLastDay(year: number, month: number, dayOfWeek: DayOfWeek): number;
}
