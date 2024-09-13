import { CultureInfo } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { SpanishNumberWithUnitExtractorConfiguration, SpanishNumberWithUnitParserConfiguration } from "./base";
export declare class SpanishCurrencyExtractorConfiguration extends SpanishNumberWithUnitExtractorConfiguration {
    readonly suffixList: ReadonlyMap<string, string>;
    readonly prefixList: ReadonlyMap<string, string>;
    readonly ambiguousUnitList: ReadonlyArray<string>;
    readonly extractType: string;
    constructor(ci?: CultureInfo);
}
export declare class SpanishCurrencyParserConfiguration extends SpanishNumberWithUnitParserConfiguration {
    constructor(ci?: CultureInfo);
}
