import { ParseResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { INumberParserConfiguration } from "../parsers";
import { CultureInfo } from "../../culture";
export declare class FrenchNumberParserConfiguration implements INumberParserConfiguration {
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
    constructor(ci?: CultureInfo);
    normalizeTokenSet(tokens: readonly string[], context: ParseResult): readonly string[];
    resolveCompositeNumber(numberStr: string): number;
}
