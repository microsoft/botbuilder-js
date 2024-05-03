import { IExtractor, ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { CultureInfo } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
export interface INumberWithUnitExtractorConfiguration {
    readonly suffixList: ReadonlyMap<string, string>;
    readonly prefixList: ReadonlyMap<string, string>;
    readonly ambiguousUnitList: ReadonlyArray<string>;
    readonly extractType: string;
    readonly cultureInfo: CultureInfo;
    readonly unitNumExtractor: IExtractor;
    readonly buildPrefix: string;
    readonly buildSuffix: string;
    readonly connectorToken: string;
    readonly compoundUnitConnectorRegex: RegExp;
    readonly pmNonUnitRegex: RegExp;
}
export declare class NumberWithUnitExtractor implements IExtractor {
    private readonly config;
    private readonly suffixRegexes;
    private readonly prefixRegexes;
    private readonly separateRegex;
    private readonly maxPrefixMatchLen;
    constructor(config: INumberWithUnitExtractorConfiguration);
    extract(source: string): Array<ExtractResult>;
    validateUnit(source: string): boolean;
    protected preCheckStr(str: string): number;
    protected extractSeparateUnits(source: string, numDependResults: Array<ExtractResult>): void;
    protected buildRegexFromSet(collection: Array<string>, ignoreCase?: boolean): Set<RegExp>;
    protected buildSeparateRegexFromSet(ignoreCase?: boolean): RegExp;
    protected dinoComparer(x: string, y: string): number;
    private isDimensionFallsInTime(dimension, time);
}
export declare class BaseMergedUnitExtractor implements IExtractor {
    private readonly config;
    private readonly innerExtractor;
    constructor(config: INumberWithUnitExtractorConfiguration);
    extract(source: string): Array<ExtractResult>;
    private mergeCompoundUnits(source);
    private MergePureNumber(source, result);
}
export declare class PrefixUnitResult {
    offset: number;
    unitString: string;
}
