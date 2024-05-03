import { BaseNumberExtractor, BasePercentageExtractor } from "../extractors";
import { NumberMode } from "../models";
export declare class SpanishNumberExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(mode?: NumberMode);
}
export declare class SpanishCardinalExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(placeholder?: string);
}
export declare class SpanishIntegerExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(placeholder?: string);
}
export declare class SpanishDoubleExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(placeholder?: string);
}
export declare class SpanishFractionExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(mode?: NumberMode);
}
export declare class SpanishOrdinalExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor();
}
export declare class SpanishPercentageExtractor extends BasePercentageExtractor {
    constructor();
    protected initRegexes(): RegExp[];
}
