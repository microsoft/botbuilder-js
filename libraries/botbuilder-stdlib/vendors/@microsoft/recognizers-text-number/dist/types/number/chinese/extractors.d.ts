import { BaseNumberExtractor } from "../extractors";
export declare enum ChineseNumberExtractorMode {
    Default = 0,
    ExtractAll = 1
}
export declare class ChineseNumberExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(mode?: ChineseNumberExtractorMode);
}
export declare class ChineseCardinalExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(mode?: ChineseNumberExtractorMode);
}
export declare class ChineseIntegerExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(mode?: ChineseNumberExtractorMode);
}
export declare class ChineseDoubleExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor();
}
export declare class ChineseFractionExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor();
}
export declare class ChineseOrdinalExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor();
}
export declare class ChinesePercentageExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor();
}
