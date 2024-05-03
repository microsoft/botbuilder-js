export interface IModel {
    readonly modelTypeName: string;
    parse(query: string): Array<ModelResult>;
}
export declare class ModelResult {
    text: string;
    start: number;
    end: number;
    typeName: string;
    resolution: {
        [key: string]: any;
    };
}
export declare class ExtendedModelResult extends ModelResult {
    parentText: string;
    constructor(source?: ModelResult);
}
export declare class ModelFactory<TModelOptions> {
    static readonly fallbackCulture: string;
    private modelFactories;
    private static cache;
    getModel(modelTypeName: string, culture: string, fallbackToDefaultCulture: boolean, options: TModelOptions): IModel;
    tryGetModel(modelTypeName: string, culture: string, options: TModelOptions): {
        containsModel: boolean;
        model?: IModel;
    };
    registerModel(modelTypeName: string, culture: string, modelCreator: (options: TModelOptions) => IModel): void;
    initializeModels(targetCulture: string, options: TModelOptions): void;
    private generateKey(modelTypeName, culture);
    private getModelFromCache(modelTypeName, culture, options);
    private registerModelInCache(modelTypeName, culture, options, model);
    private generateCacheKey(modelTypeName, culture, options);
}
