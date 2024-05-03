import { IModel, ModelResult, IExtractor, IParser } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
export declare abstract class AbstractSequenceModel implements IModel {
    readonly abstract modelTypeName: string;
    protected readonly extractor: IExtractor;
    protected readonly parser: IParser;
    constructor(parser: IParser, extractor: IExtractor);
    parse(query: string): ModelResult[];
}
export declare class PhoneNumberModel extends AbstractSequenceModel {
    modelTypeName: string;
    parse(query: string): ModelResult[];
}
export declare class IpAddressModel extends AbstractSequenceModel {
    modelTypeName: string;
    parse(query: string): ModelResult[];
}
export declare class MentionModel extends AbstractSequenceModel {
    modelTypeName: string;
}
export declare class HashtagModel extends AbstractSequenceModel {
    modelTypeName: string;
}
export declare class EmailModel extends AbstractSequenceModel {
    modelTypeName: string;
}
export declare class URLModel extends AbstractSequenceModel {
    modelTypeName: string;
}
export declare class GUIDModel extends AbstractSequenceModel {
    modelTypeName: string;
}
