import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseDateTimePeriodExtractor, BaseDateTimePeriodParser } from "../baseDateTimePeriod";
import { Token, DateTimeResolutionResult } from "../utilities";
import { DateTimeParseResult } from "../parsers";
export declare class ChineseDateTimePeriodExtractor extends BaseDateTimePeriodExtractor {
    private readonly zhijianRegex;
    private readonly pastRegex;
    private readonly futureRegex;
    constructor();
    extract(source: string, refDate: Date): Array<ExtractResult>;
    private mergeDateAndTimePeriod(source, refDate);
    protected mergeTwoTimePoints(source: string, refDate: Date): Array<Token>;
    private matchNubmerWithUnit(source);
    protected matchNight(source: string, refDate: Date): Array<Token>;
}
export declare class ChineseDateTimePeriodParser extends BaseDateTimePeriodParser {
    private readonly TMORegex;
    private readonly TAFRegex;
    private readonly TEVRegex;
    private readonly TNIRegex;
    RegExp: any;
    private readonly unitRegex;
    private readonly timeOfDayRegex;
    private readonly cardinalExtractor;
    private readonly cardinalParser;
    constructor();
    parse(extractorResult: ExtractResult, referenceDate?: Date): DateTimeParseResult | null;
    protected mergeDateAndTimePeriods(text: string, referenceTime: Date): DateTimeResolutionResult;
    protected mergeTwoTimePoints(text: string, referenceTime: Date): DateTimeResolutionResult;
    protected parseSpecificTimeOfDay(text: string, referenceTime: Date): DateTimeResolutionResult;
    protected parseNumberWithUnit(text: string, referenceTime: Date): DateTimeResolutionResult;
    protected parseDuration(text: string, referenceTime: Date): DateTimeResolutionResult;
    private parseCommonDurationWithUnit(beforeStr, sourceUnit, numStr, swift, referenceDate);
}
