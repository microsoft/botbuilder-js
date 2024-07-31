import { CultureInfo } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { FrenchNumberWithUnitExtractorConfiguration, FrenchNumberWithUnitParserConfiguration } from "./base";
export declare class FrenchAgeExtractorConfiguration extends FrenchNumberWithUnitExtractorConfiguration {
    readonly suffixList: ReadonlyMap<string, string>;
    readonly prefixList: ReadonlyMap<string, string>;
    readonly ambiguousUnitList: ReadonlyArray<string>;
    readonly extractType: string;
    constructor(ci?: CultureInfo);
}
export declare class FrenchAgeParserConfiguration extends FrenchNumberWithUnitParserConfiguration {
    constructor(ci?: CultureInfo);
}
