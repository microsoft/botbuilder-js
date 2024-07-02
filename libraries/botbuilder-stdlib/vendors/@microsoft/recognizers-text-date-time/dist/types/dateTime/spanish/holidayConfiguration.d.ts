import { IHolidayExtractorConfiguration, BaseHolidayParserConfiguration } from "../baseHoliday";
export declare class SpanishHolidayExtractorConfiguration implements IHolidayExtractorConfiguration {
    readonly holidayRegexes: RegExp[];
    constructor();
}
export declare class SpanishHolidayParserConfiguration extends BaseHolidayParserConfiguration {
    readonly nextPrefixRegex: RegExp;
    readonly pastPrefixRegex: RegExp;
    readonly thisPrefixRegex: RegExp;
    constructor();
    protected initHolidayFuncs(): ReadonlyMap<string, (year: number) => Date>;
    private static NewYear(year);
    private static NewYearEve(year);
    private static ChristmasDay(year);
    private static ChristmasEve(year);
    private static FemaleDay(year);
    private static ChildrenDay(year);
    private static HalloweenDay(year);
    private static TeacherDay(year);
    private static EasterDay(year);
    getSwiftYear(text: string): number;
    sanitizeHolidayToken(holiday: string): string;
}
