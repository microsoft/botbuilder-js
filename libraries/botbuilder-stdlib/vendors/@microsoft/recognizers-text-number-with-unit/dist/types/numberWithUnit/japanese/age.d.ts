import { CultureInfo } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { JapaneseNumberWithUnitExtractorConfiguration, JapaneseNumberWithUnitParserConfiguration } from "./base";
export declare class JapaneseAgeExtractorConfiguration extends JapaneseNumberWithUnitExtractorConfiguration {
    readonly suffixList: ReadonlyMap<string, string>;
    readonly prefixList: ReadonlyMap<string, string>;
    readonly ambiguousUnitList: ReadonlyArray<string>;
    readonly extractType: string;
    constructor(ci?: CultureInfo);
}
export declare class JapaneseAgeParserConfiguration extends JapaneseNumberWithUnitParserConfiguration {
    constructor(ci?: CultureInfo);
}
