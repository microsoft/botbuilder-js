import { IParser, ParseResult, ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { CultureInfo } from "../culture";
export interface INumberParserConfiguration {
    readonly cardinalNumberMap: ReadonlyMap<string, number>;
    readonly ordinalNumberMap: ReadonlyMap<string, number>;
    readonly roundNumberMap: ReadonlyMap<string, number>;
    readonly cultureInfo: CultureInfo;
    readonly digitalNumberRegex: RegExp;
    readonly fractionMarkerToken: string;
    readonly negativeNumberSignRegex: RegExp;
    readonly halfADozenRegex: RegExp;
    readonly halfADozenText: string;
    readonly langMarker: string;
    readonly nonDecimalSeparatorChar: string;
    readonly decimalSeparatorChar: string;
    readonly wordSeparatorToken: string;
    readonly writtenDecimalSeparatorTexts: readonly string[];
    readonly writtenGroupSeparatorTexts: readonly string[];
    readonly writtenIntegerSeparatorTexts: readonly string[];
    readonly writtenFractionSeparatorTexts: readonly string[];
    normalizeTokenSet(tokens: readonly string[], context: ParseResult): readonly string[];
    resolveCompositeNumber(numberStr: string): number;
}
export declare class BaseNumberParser implements IParser {
    protected readonly config: INumberParserConfiguration;
    protected readonly textNumberRegex: RegExp;
    protected readonly arabicNumberRegex: RegExp;
    protected readonly roundNumberSet: Set<string>;
    supportedTypes: readonly string[];
    constructor(config: INumberParserConfiguration);
    parse(extResult: ExtractResult): ParseResult | null;
    protected getKeyRegex(regexMap: ReadonlyMap<string, number>): string;
    protected digitNumberParse(extResult: ExtractResult): ParseResult;
    protected isDigit(c: string): boolean;
    protected fracLikeNumberParse(extResult: ExtractResult): ParseResult;
    protected textNumberParse(extResult: ExtractResult): ParseResult;
    protected powerNumberParse(extResult: ExtractResult): ParseResult;
    private splitMulti;
    private getMatches;
    private isComposable;
    private getIntValue;
    private getPointValue;
    private skipNonDecimalSeparator;
    protected getDigitalValue(digitsStr: string, power: number): number;
}
export declare class BasePercentageParser extends BaseNumberParser {
    parse(extResult: ExtractResult): ParseResult | null;
}
