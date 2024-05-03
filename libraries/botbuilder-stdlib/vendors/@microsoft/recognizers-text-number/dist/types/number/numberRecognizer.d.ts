import { IModel, ModelResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { Recognizer } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
export declare enum NumberOptions {
    None = 0
}
export declare function recognizeNumber(query: string, culture: string, options?: NumberOptions, fallbackToDefaultCulture?: boolean): ModelResult[];
export declare function recognizeOrdinal(query: string, culture: string, options?: NumberOptions, fallbackToDefaultCulture?: boolean): ModelResult[];
export declare function recognizePercentage(query: string, culture: string, options?: NumberOptions, fallbackToDefaultCulture?: boolean): ModelResult[];
export default class NumberRecognizer extends Recognizer<NumberOptions> {
    constructor(culture: any, options?: NumberOptions, lazyInitialization?: boolean);
    protected InitializeConfiguration(): void;
    protected IsValidOptions(options: number): boolean;
    getNumberModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
    getOrdinalModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
    getPercentageModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
}
