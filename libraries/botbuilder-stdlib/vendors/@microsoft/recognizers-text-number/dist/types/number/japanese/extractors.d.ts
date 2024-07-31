import { BaseNumberExtractor } from "../extractors";
export declare enum JapaneseNumberExtractorMode {
    Default = 0,
    ExtractAll = 1
}
export declare class JapaneseNumberExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(mode?: JapaneseNumberExtractorMode);
}
export declare class JapaneseCardinalExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(mode?: JapaneseNumberExtractorMode);
}
export declare class JapaneseIntegerExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor(mode?: JapaneseNumberExtractorMode);
}
export declare class JapaneseDoubleExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor();
}
export declare class JapaneseFractionExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor();
}
export declare class JapaneseOrdinalExtractor extends BaseNumberExtractor {
    protected extractType: string;
    constructor();
}
export declare class JapanesePercentageExtractor extends BaseNumberExtractor {
    extractType: string;
    constructor();
}
