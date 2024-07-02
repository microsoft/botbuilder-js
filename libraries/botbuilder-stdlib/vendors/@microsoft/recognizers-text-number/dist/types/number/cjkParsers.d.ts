import { ExtractResult, ParseResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseNumberParser, INumberParserConfiguration } from "./parsers";
export interface ICJKNumberParserConfiguration extends INumberParserConfiguration {
    readonly zeroToNineMap: ReadonlyMap<string, number>;
    readonly roundNumberMapChar: ReadonlyMap<string, number>;
    readonly fullToHalfMap: ReadonlyMap<string, string>;
    readonly tratoSimMap: ReadonlyMap<string, string>;
    readonly unitMap: ReadonlyMap<string, string>;
    readonly roundDirectList: readonly string[];
    readonly tenChars: readonly string[];
    readonly digitNumRegex: RegExp;
    readonly dozenRegex: RegExp;
    readonly percentageRegex: RegExp;
    readonly percentageNumRegex: RegExp;
    readonly doubleAndRoundRegex: RegExp;
    readonly fracSplitRegex: RegExp;
    readonly pointRegex: RegExp;
    readonly speGetNumberRegex: RegExp;
    readonly pairRegex: RegExp;
    readonly roundNumberIntegerRegex: RegExp;
    readonly zeroChar: string;
    readonly pairChar: string;
}
export declare class BaseCJKNumberParser extends BaseNumberParser {
    readonly config: ICJKNumberParserConfiguration;
    constructor(config: ICJKNumberParserConfiguration);
    private toString;
    private isDigitCode;
    parse(extResult: ExtractResult): ParseResult | null;
    private replaceTraditionalWithSimplified;
    private replaceFullWithHalf;
    private replaceUnit;
    private perParseCJK;
    private fracParseCJK;
    private douParseCJK;
    private intParseCJK;
    private ordParseCJK;
    private getDigitValueCJK;
    private getIntValueCJK;
    private getPointValueCJK;
    private isDigitCJK;
}
