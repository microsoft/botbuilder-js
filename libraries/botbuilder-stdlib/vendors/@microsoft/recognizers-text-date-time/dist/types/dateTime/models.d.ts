import { IModel, ModelResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { IDateTimeParser } from "./parsers";
import { IDateTimeExtractor } from "./baseDateTime";
export declare class DateTimeModelResult extends ModelResult {
    timexStr: string;
}
export interface IDateTimeModel extends IModel {
    parse(query: string, referenceDate?: Date): ModelResult[];
}
export declare class DateTimeModel implements IDateTimeModel {
    modelTypeName: string;
    protected readonly extractor: IDateTimeExtractor;
    protected readonly parser: IDateTimeParser;
    constructor(parser: IDateTimeParser, extractor: IDateTimeExtractor);
    parse(query: string, referenceDate?: Date): ModelResult[];
}
