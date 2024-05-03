import { IExtractor, ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
export declare abstract class BaseSequenceExtractor implements IExtractor {
    abstract regexes: Map<RegExp, string>;
    protected extractType: string;
    extract(source: string): Array<ExtractResult>;
}
export declare class BasePhoneNumberExtractor extends BaseSequenceExtractor {
    regexes: Map<RegExp, string>;
    constructor();
    extract(source: string): Array<ExtractResult>;
}
export declare class BaseIpExtractor extends BaseSequenceExtractor {
    regexes: Map<RegExp, string>;
    constructor();
    extract(source: string): Array<ExtractResult>;
    isLetterOrDigit(c: string): boolean;
}
export declare class BaseMentionExtractor extends BaseSequenceExtractor {
    regexes: Map<RegExp, string>;
    constructor();
}
export declare class BaseHashtagExtractor extends BaseSequenceExtractor {
    regexes: Map<RegExp, string>;
    constructor();
}
export declare class BaseEmailExtractor extends BaseSequenceExtractor {
    regexes: Map<RegExp, string>;
    constructor();
}
export declare class BaseURLExtractor extends BaseSequenceExtractor {
    regexes: Map<RegExp, string>;
    constructor();
}
export declare class BaseGUIDExtractor extends BaseSequenceExtractor {
    regexes: Map<RegExp, string>;
    constructor();
}
