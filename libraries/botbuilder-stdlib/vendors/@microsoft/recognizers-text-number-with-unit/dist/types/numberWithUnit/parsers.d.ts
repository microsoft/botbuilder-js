import { IExtractor, ExtractResult, IParser, ParseResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { CultureInfo } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
export declare class UnitValue {
    number: string;
    unit: string;
}
export declare class UnitValueIso extends UnitValue {
    isoCurrency: string;
}
export interface INumberWithUnitParserConfiguration {
    readonly unitMap: Map<string, string>;
    readonly cultureInfo: CultureInfo;
    readonly internalNumberParser: IParser;
    readonly internalNumberExtractor: IExtractor;
    readonly connectorToken: string;
    readonly currencyNameToIsoCodeMap: ReadonlyMap<string, string>;
    readonly currencyFractionCodeList: ReadonlyMap<string, string>;
    readonly currencyFractionNumMap: ReadonlyMap<string, number>;
    readonly currencyFractionMapping: ReadonlyMap<string, string>;
    BindDictionary(dictionary: Map<string, string>): void;
}
export declare abstract class BaseNumberWithUnitParserConfiguration implements INumberWithUnitParserConfiguration {
    unitMap: Map<string, string>;
    cultureInfo: CultureInfo;
    abstract internalNumberParser: IParser;
    abstract internalNumberExtractor: IExtractor;
    abstract connectorToken: string;
    abstract currencyNameToIsoCodeMap: ReadonlyMap<string, string>;
    abstract currencyFractionCodeList: ReadonlyMap<string, string>;
    readonly currencyFractionNumMap: ReadonlyMap<string, number>;
    readonly currencyFractionMapping: ReadonlyMap<string, string>;
    constructor(cultureInfo: CultureInfo);
    BindDictionary(dictionary: ReadonlyMap<string, string>): void;
}
export declare class NumberWithUnitParser implements IParser {
    protected readonly config: INumberWithUnitParserConfiguration;
    constructor(config: INumberWithUnitParserConfiguration);
    parse(extResult: ExtractResult): ParseResult;
    private addIfNotContained(keys, newKey);
}
export declare class BaseCurrencyParser implements IParser {
    protected readonly config: INumberWithUnitParserConfiguration;
    private readonly numberWithUnitParser;
    constructor(config: INumberWithUnitParserConfiguration);
    parse(extResult: ExtractResult): ParseResult;
    private mergeCompoundUnit(compoundResult);
    private checkUnitsStringContains(fractionUnitCode, fractionUnitsString);
    private resolveText(prs, source, bias);
}
export declare class BaseMergedUnitParser implements IParser {
    protected readonly config: INumberWithUnitParserConfiguration;
    private readonly numberWithUnitParser;
    private readonly currencyParser;
    constructor(config: INumberWithUnitParserConfiguration);
    parse(extResult: ExtractResult): ParseResult;
}
