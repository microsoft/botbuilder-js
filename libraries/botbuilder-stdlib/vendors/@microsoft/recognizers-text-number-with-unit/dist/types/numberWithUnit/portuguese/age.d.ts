import { CultureInfo } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { PortugueseNumberWithUnitExtractorConfiguration, PortugueseNumberWithUnitParserConfiguration } from "./base";
export declare class PortugueseAgeExtractorConfiguration extends PortugueseNumberWithUnitExtractorConfiguration {
    readonly suffixList: ReadonlyMap<string, string>;
    readonly prefixList: ReadonlyMap<string, string>;
    readonly ambiguousUnitList: ReadonlyArray<string>;
    readonly extractType: string;
    constructor(ci?: CultureInfo);
}
export declare class PortugueseAgeParserConfiguration extends PortugueseNumberWithUnitParserConfiguration {
    constructor(ci?: CultureInfo);
}
