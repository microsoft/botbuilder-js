import { BaseNumberExtractor, BasePercentageExtractor } from "../extractors";
import { NumberMode } from "../models";
export declare class EnglishNumberExtractor extends BaseNumberExtractor {
    protected extractType: string;
    protected negativeNumberTermsRegex: RegExp;
    constructor(mode?: NumberMode);
}
export declare class EnglishCardinalExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(placeholder?: string);
}
export declare class EnglishIntegerExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(placeholder?: string);
}
export declare class EnglishDoubleExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(placeholder?: string);
}
export declare class EnglishFractionExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(mode?: NumberMode);
}
export declare class EnglishOrdinalExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor();
}
export declare class EnglishPercentageExtractor extends BasePercentageExtractor {
    constructor();
    protected initRegexes(): RegExp[];
}
