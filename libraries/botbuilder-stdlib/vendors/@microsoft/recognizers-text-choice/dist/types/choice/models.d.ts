import { IModel, ModelResult, IExtractor, IParser } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
export declare abstract class ChoiceModel implements IModel {
    readonly abstract modelTypeName: string;
    protected readonly extractor: IExtractor;
    protected readonly parser: IParser;
    constructor(parser: IParser, extractor: IExtractor);
    parse(source: string): ModelResult[];
    protected abstract getResolution(data: any): any;
}
export declare class BooleanModel extends ChoiceModel {
    readonly modelTypeName: string;
    protected getResolution(sources: any): any;
}
