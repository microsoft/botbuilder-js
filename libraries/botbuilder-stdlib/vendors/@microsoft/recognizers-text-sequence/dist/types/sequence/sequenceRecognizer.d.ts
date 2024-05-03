import { Recognizer, IModel, ModelResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
export declare enum SequenceOptions {
    None = 0,
}
export declare function recognizePhoneNumber(query: string, culture: string, options?: SequenceOptions): Array<ModelResult>;
export declare function recognizeIpAddress(query: string, culture: string, options?: SequenceOptions): Array<ModelResult>;
export declare function recognizeMention(query: string, culture: string, options?: SequenceOptions): Array<ModelResult>;
export declare function recognizeHashtag(query: string, culture: string, options?: SequenceOptions): Array<ModelResult>;
export declare function recognizeEmail(query: string, culture: string, options?: SequenceOptions): Array<ModelResult>;
export declare function recognizeURL(query: string, culture: string, options?: SequenceOptions): Array<ModelResult>;
export declare function recognizeGUID(query: string, culture: string, options?: SequenceOptions): Array<ModelResult>;
export default class SequenceRecognizer extends Recognizer<SequenceOptions> {
    constructor(culture: string, options?: SequenceOptions, lazyInitialization?: boolean);
    protected IsValidOptions(options: any): boolean;
    protected InitializeConfiguration(): void;
    getPhoneNumberModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
    getIpAddressModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
    getMentionModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
    getHashtagModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
    getEmailModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
    getURLModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
    getGUIDModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
}
