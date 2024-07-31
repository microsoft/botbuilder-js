import { Recognizer, IModel, ModelResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
export declare enum ChoiceOptions {
    None = 0,
}
export declare function recognizeBoolean(query: string, culture: string, options?: ChoiceOptions, fallbackToDefaultCulture?: boolean): Array<ModelResult>;
export default class ChoiceRecognizer extends Recognizer<ChoiceOptions> {
    constructor(culture: string, options?: ChoiceOptions, lazyInitialization?: boolean);
    protected InitializeConfiguration(): void;
    protected IsValidOptions(options: number): boolean;
    getBooleanModel(culture?: string, fallbackToDefaultCulture?: boolean): IModel;
}
