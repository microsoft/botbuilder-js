import { BasePhoneNumberExtractor, BaseIpExtractor, BaseMentionExtractor, BaseHashtagExtractor, BaseEmailExtractor, BaseURLExtractor, BaseGUIDExtractor } from "../extractors";
import { ExtractResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
export declare class PhoneNumberExtractor extends BasePhoneNumberExtractor {
    extract(source: string): Array<ExtractResult>;
}
export declare class IpExtractor extends BaseIpExtractor {
}
export declare class MentionExtractor extends BaseMentionExtractor {
}
export declare class HashtagExtractor extends BaseHashtagExtractor {
}
export declare class EmailExtractor extends BaseEmailExtractor {
}
export declare class URLExtractor extends BaseURLExtractor {
}
export declare class GUIDExtractor extends BaseGUIDExtractor {
}
