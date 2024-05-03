import { BaseNumberExtractor, BasePercentageExtractor } from "../extractors";
import { NumberMode } from "../models";
export declare class PortugueseNumberExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(mode?: NumberMode);
}
export declare class PortugueseCardinalExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(placeholder?: string);
}
export declare class PortugueseIntegerExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(placeholder?: string);
}
export declare class PortugueseDoubleExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(placeholder?: string);
}
export declare class PortugueseFractionExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(mode?: NumberMode);
}
export declare class PortugueseOrdinalExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor();
}
export declare class PortuguesePercentageExtractor extends BasePercentageExtractor {
    constructor();
    protected initRegexes(): RegExp[];
}
