import { CultureInfo } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { ChineseNumberWithUnitExtractorConfiguration, ChineseNumberWithUnitParserConfiguration } from "./base";
export declare class ChineseTemperatureExtractorConfiguration extends ChineseNumberWithUnitExtractorConfiguration {
    readonly suffixList: ReadonlyMap<string, string>;
    readonly prefixList: ReadonlyMap<string, string>;
    readonly ambiguousUnitList: ReadonlyArray<string>;
    readonly extractType: string;
    constructor(ci?: CultureInfo);
}
export declare class ChineseTemperatureParserConfiguration extends ChineseNumberWithUnitParserConfiguration {
    constructor(ci?: CultureInfo);
}
