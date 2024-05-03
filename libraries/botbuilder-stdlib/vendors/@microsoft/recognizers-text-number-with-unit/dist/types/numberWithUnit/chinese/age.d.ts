import { CultureInfo } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { ChineseNumberWithUnitExtractorConfiguration, ChineseNumberWithUnitParserConfiguration } from "./base";
export declare class ChineseAgeExtractorConfiguration extends ChineseNumberWithUnitExtractorConfiguration {
    readonly suffixList: ReadonlyMap<string, string>;
    readonly prefixList: ReadonlyMap<string, string>;
    readonly ambiguousUnitList: ReadonlyArray<string>;
    readonly extractType: string;
    constructor(ci?: CultureInfo);
}
export declare class ChineseAgeParserConfiguration extends ChineseNumberWithUnitParserConfiguration {
    constructor(ci?: CultureInfo);
}
