import { IModel, ModelResult, IExtractor, IParser } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
export declare enum NumberMode {
    Default = 0,
    Currency = 1,
    PureNumber = 2,
    Unit = 3
}
export declare class LongFormatType {
    static readonly integerNumComma: LongFormatType;
    static readonly integerNumDot: LongFormatType;
    static readonly integerNumBlank: LongFormatType;
    static readonly integerNumNoBreakSpace: LongFormatType;
    static readonly integerNumQuote: LongFormatType;
    static readonly doubleNumCommaDot: LongFormatType;
    static readonly doubleNumCommaCdot: LongFormatType;
    static readonly doubleNumBlankComma: LongFormatType;
    static readonly doubleNumNoBreakSpaceComma: LongFormatType;
    static readonly doubleNumBlankDot: LongFormatType;
    static readonly doubleNumNoBreakSpaceDot: LongFormatType;
    static readonly doubleNumDotComma: LongFormatType;
    static readonly doubleNumQuoteComma: LongFormatType;
    readonly thousandsMark: string;
    readonly decimalsMark: string;
    constructor(thousandsMark: string, decimalsMark: string);
}
export declare abstract class AbstractNumberModel implements IModel {
    abstract modelTypeName: string;
    protected readonly parser: IParser;
    protected readonly extractor: IExtractor;
    constructor(parser: IParser, extractor: IExtractor);
    parse(query: string): ModelResult[];
}
export declare class NumberModel extends AbstractNumberModel {
    modelTypeName: string;
}
export declare class OrdinalModel extends AbstractNumberModel {
    modelTypeName: string;
}
export declare class PercentModel extends AbstractNumberModel {
    modelTypeName: string;
}
