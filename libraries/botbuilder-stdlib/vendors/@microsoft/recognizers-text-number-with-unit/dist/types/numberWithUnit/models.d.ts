import { IModel, ModelResult, IExtractor, IParser } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
export declare enum CompositeEntityType {
    Age = 0,
    Currency = 1,
    Dimension = 2,
    Temperature = 3,
}
export declare abstract class AbstractNumberWithUnitModel implements IModel {
    protected extractorParsersMap: Map<IExtractor, IParser>;
    abstract modelTypeName: string;
    constructor(extractorParsersMap: Map<IExtractor, IParser>);
    parse(query: string): Array<ModelResult>;
    private getResolution(data);
}
export declare class AgeModel extends AbstractNumberWithUnitModel {
    modelTypeName: string;
}
export declare class CurrencyModel extends AbstractNumberWithUnitModel {
    modelTypeName: string;
}
export declare class DimensionModel extends AbstractNumberWithUnitModel {
    modelTypeName: string;
}
export declare class TemperatureModel extends AbstractNumberWithUnitModel {
    modelTypeName: string;
}
