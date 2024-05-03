import { IExtractor, ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
export interface IChoiceExtractorConfiguration {
    regexesMap: Map<RegExp, string>;
    tokenRegex: RegExp;
    allowPartialMatch: boolean;
    maxDistance: number;
    onlyTopMatch: boolean;
}
export declare class ChoiceExtractor implements IExtractor {
    private readonly config;
    protected extractType: string;
    constructor(config: IChoiceExtractorConfiguration);
    extract(source: string): Array<ExtractResult>;
    matchValue(source: string[], match: string[], startPos: number): number;
    private tokenize(source);
}
export interface IBooleanExtractorConfiguration {
    regexTrue: RegExp;
    regexFalse: RegExp;
    tokenRegex: RegExp;
    onlyTopMatch: boolean;
}
export declare class BooleanExtractor extends ChoiceExtractor {
    private static readonly booleanTrue;
    private static readonly booleanFalse;
    constructor(config: IBooleanExtractorConfiguration);
}
