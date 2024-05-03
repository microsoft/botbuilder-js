import { IParser, ExtractResult, ParseResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
export declare class BaseSequenceParser implements IParser {
    parse(extResult: ExtractResult): ParseResult;
}
export declare class BaseIpParser extends BaseSequenceParser {
    parse(extResult: ExtractResult): ParseResult;
    private dropLeadingZeros(text);
}
