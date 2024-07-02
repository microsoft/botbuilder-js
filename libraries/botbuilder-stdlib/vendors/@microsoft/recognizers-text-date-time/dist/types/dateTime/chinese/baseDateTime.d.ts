import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { IDateTimeExtractor } from "../baseDateTime";
export interface DateTimeExtra<T> {
    dataType: T;
    namedEntity(key: string): {
        value: string;
        index: number;
        length: number;
        captures: string[];
    };
}
export declare class TimeResult {
    hour: number;
    minute: number;
    second: number;
    lowBound: number;
    constructor(hour: number, minute: number, second: number, lowBound?: number);
}
export declare abstract class BaseDateTimeExtractor<T> implements IDateTimeExtractor {
    protected readonly abstract extractorName: string;
    private readonly regexesDictionary;
    constructor(regexesDictionary: Map<RegExp, T>);
    extract(source: string, refDate: Date): Array<ExtractResult>;
}
export declare class TimeResolutionUtils {
    static addDescription(lowBoundMap: ReadonlyMap<string, number>, timeResult: TimeResult, description: string): void;
    static normalizeDesc(description: string): string;
    static matchToValue(onlyDigitMatch: RegExp, numbersMap: ReadonlyMap<string, number>, source: string): number;
}
