import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseDateTimeExtractor } from "./baseDateTime";
import { BaseDurationParser } from "../baseDuration";
import { DateTimeParseResult } from "../parsers";
export declare enum DurationType {
    WithNumber = 0,
}
export declare class ChineseDurationExtractor extends BaseDateTimeExtractor<DurationType> {
    protected extractorName: string;
    private readonly extractor;
    private readonly yearRegex;
    private readonly halfSuffixRegex;
    constructor();
    extract(source: string, refDate: Date): Array<ExtractResult>;
}
export declare class ChineseDurationParser extends BaseDurationParser {
    private readonly internalParser;
    constructor();
    parse(extractorResult: ExtractResult, referenceDate?: Date): DateTimeParseResult | null;
}
