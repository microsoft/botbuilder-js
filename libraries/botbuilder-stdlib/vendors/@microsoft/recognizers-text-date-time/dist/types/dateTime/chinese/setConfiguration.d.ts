import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BaseSetExtractor, BaseSetParser } from "../baseSet";
import { IDateTimeParser, DateTimeParseResult } from "../parsers";
import { IDateTimeExtractor } from "../baseDateTime";
import { DateTimeResolutionResult } from "../utilities";
export declare class ChineseSetExtractor extends BaseSetExtractor {
    constructor();
    extract(source: string, refDate: Date): Array<ExtractResult>;
    private matchEachSpecific(extractor, eachRegex, source, refDate);
}
export declare class ChineseSetParser extends BaseSetParser {
    constructor();
    parse(er: ExtractResult, referenceDate?: Date): DateTimeParseResult | null;
    protected parseEachUnit(text: string): DateTimeResolutionResult;
    protected parserTimeEveryday(text: string, refDate: Date): DateTimeResolutionResult;
    protected parseEach(extractor: IDateTimeExtractor, parser: IDateTimeParser, text: string, refDate: Date): DateTimeResolutionResult;
}
