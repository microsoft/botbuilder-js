import { BaseNumberExtractor, BasePercentageExtractor } from "../extractors";
import { NumberMode } from "../models";
export declare class FrenchNumberExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(mode?: NumberMode);
}
export declare class FrenchCardinalExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(placeholder?: string);
}
export declare class FrenchIntegerExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(placeholder?: string);
}
export declare class FrenchDoubleExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(placeholder?: string);
}
export declare class FrenchFractionExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(mode?: NumberMode);
}
export declare class FrenchOrdinalExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor();
}
export declare class FrenchPercentageExtractor extends BasePercentageExtractor {
    constructor();
    protected initRegexes(): RegExp[];
}
