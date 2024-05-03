import { Match, ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { IHolidayExtractorConfiguration, BaseHolidayParser } from "../baseHoliday";
import { DateTimeResolutionResult } from "../utilities";
import { DateTimeParseResult } from "../parsers";
export declare class ChineseHolidayExtractorConfiguration implements IHolidayExtractorConfiguration {
    readonly holidayRegexes: RegExp[];
    constructor();
}
export declare class ChineseHolidayParser extends BaseHolidayParser {
    private readonly lunarHolidayRegex;
    RegExp: any;
    private readonly integerExtractor;
    private readonly numberParser;
    private readonly fixedHolidayDictionary;
    constructor();
    private static NewYear(year);
    private static ChsNationalDay(year);
    private static LaborDay(year);
    private static ChristmasDay(year);
    private static LoverDay(year);
    private static ChsMilBuildDay(year);
    private static FoolDay(year);
    private static GirlsDay(year);
    private static TreePlantDay(year);
    private static FemaleDay(year);
    private static ChildrenDay(year);
    private static YouthDay(year);
    private static TeacherDay(year);
    private static SinglesDay(year);
    private static HalloweenDay(year);
    private static MidautumnDay(year);
    private static SpringDay(year);
    private static NewYearEve(year);
    private static LanternDay(year);
    private static QingMingDay(year);
    private static DragonBoatDay(year);
    private static ChongYangDay(year);
    parse(er: ExtractResult, referenceDate?: Date): DateTimeParseResult;
    private isLunar(source);
    protected match2Date(match: Match, referenceDate: Date): DateTimeResolutionResult;
    private convertYear(yearStr, isChinese);
    private getDateValue(date, referenceDate, holiday, swift, comparer);
}
