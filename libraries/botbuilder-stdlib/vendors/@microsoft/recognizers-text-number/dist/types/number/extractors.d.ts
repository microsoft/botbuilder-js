import { IExtractor, ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { LongFormatType } from "./models";
export interface RegExpValue {
    regExp: RegExp;
    value: string;
}
export interface RegExpRegExp {
    regExpKey: RegExp;
    regExpValue: RegExp;
}
export declare abstract class BaseNumberExtractor implements IExtractor {
    regexes: RegExpValue[];
    ambiguityFiltersDict: RegExpRegExp[];
    protected extractType: string;
    protected negativeNumberTermsRegex: RegExp;
    extract(source: string): ExtractResult[];
    private filterAmbiguity;
    protected generateLongFormatNumberRegexes(type: LongFormatType, placeholder?: string): RegExp;
}
export declare abstract class BasePercentageExtractor implements IExtractor {
    regexes: RegExp[];
    protected static readonly numExtType: string;
    protected extractType: string;
    private readonly numberExtractor;
    constructor(numberExtractor: BaseNumberExtractor);
    protected abstract initRegexes(): RegExp[];
    extract(source: string): ExtractResult[];
    private preprocessStrWithNumberExtracted;
    private postProcessing;
    protected buildRegexes(regexStrs: string[], ignoreCase?: boolean): RegExp[];
}
