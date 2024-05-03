import { IExtractor, IParser } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { CultureInfo } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { INumberWithUnitExtractorConfiguration } from "../extractors";
import { BaseNumberWithUnitParserConfiguration } from "../parsers";
export declare abstract class PortugueseNumberWithUnitExtractorConfiguration implements INumberWithUnitExtractorConfiguration {
    readonly abstract suffixList: ReadonlyMap<string, string>;
    readonly abstract prefixList: ReadonlyMap<string, string>;
    readonly abstract ambiguousUnitList: ReadonlyArray<string>;
    readonly abstract extractType: string;
    readonly cultureInfo: CultureInfo;
    readonly unitNumExtractor: IExtractor;
    readonly buildPrefix: string;
    readonly buildSuffix: string;
    readonly connectorToken: string;
    readonly compoundUnitConnectorRegex: RegExp;
    readonly pmNonUnitRegex: RegExp;
    constructor(ci: CultureInfo);
}
export declare class PortugueseNumberWithUnitParserConfiguration extends BaseNumberWithUnitParserConfiguration {
    readonly internalNumberParser: IParser;
    readonly internalNumberExtractor: IExtractor;
    readonly connectorToken: string;
    readonly currencyNameToIsoCodeMap: ReadonlyMap<string, string>;
    readonly currencyFractionCodeList: ReadonlyMap<string, string>;
    constructor(ci: CultureInfo);
}
