import { IModel, ModelResult, Recognizer } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
export declare enum NumberWithUnitOptions {
    None = 0,
}
export declare function recognizeCurrency(query: string, culture: string, options?: NumberWithUnitOptions, fallbackToDefaultCulture?: boolean): Array<ModelResult>;
export declare function recognizeTemperature(query: string, culture: string, options?: NumberWithUnitOptions, fallbackToDefaultCulture?: boolean): Array<ModelResult>;
export declare function recognizeDimension(query: string, culture: string, options?: NumberWithUnitOptions, fallbackToDefaultCulture?: boolean): Array<ModelResult>;
export declare function recognizeAge(query: string, culture: string, options?: NumberWithUnitOptions, fallbackToDefaultCulture?: boolean): Array<ModelResult>;
export default class NumberWithUnitRecognizer extends Recognizer<NumberWithUnitOptions> {
    constructor(culture: string, options?: NumberWithUnitOptions, lazyInitialization?: boolean);
    protected InitializeConfiguration(): void;
    protected IsValidOptions(options: number): boolean;
    getCurrencyModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
    getTemperatureModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
    getDimensionModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
    getAgeModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
}
