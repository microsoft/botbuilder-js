import { IModel } from "./models";
export declare abstract class Recognizer<TRecognizerOptions> {
    readonly Options: TRecognizerOptions;
    readonly TargetCulture: string;
    private readonly modelFactory;
    protected constructor(targetCulture: string, options: TRecognizerOptions, lazyInitialization: boolean);
    protected abstract InitializeConfiguration(): any;
    protected abstract IsValidOptions(options: any): boolean;
    getModel(modelTypeName: string, culture: string, fallbackToDefaultCulture: boolean): IModel;
    registerModel(modelTypeName: string, culture: string, modelCreator: (options: TRecognizerOptions) => IModel): void;
    private initializeModels(targetCulture, options);
}
