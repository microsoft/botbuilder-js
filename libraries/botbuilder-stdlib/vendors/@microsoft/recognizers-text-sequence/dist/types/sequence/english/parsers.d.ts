import { BaseSequenceParser, BaseIpParser } from "../parsers";
import { ExtractResult, ParseResult } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
export declare class PhoneNumberParser extends BaseSequenceParser {
    scoreUpperLimit: number;
    scoreLowerLimit: number;
    baseScore: number;
    countryCodeAward: number;
    areaCodeAward: number;
    formattedAward: number;
    lengthAward: number;
    typicalFormatDeductionScore: number;
    continueDigitDeductionScore: number;
    tailSameDeductionScore: number;
    continueFormatIndicatorDeductionScore: number;
    maxFormatIndicatorNum: number;
    maxLengthAwardNum: number;
    tailSameLimit: number;
    phoneNumberLengthBase: number;
    pureDigitLengthLimit: number;
    tailSameDigitRegex: RegExp;
    pureDigitRegex: RegExp;
    continueDigitRegex: RegExp;
    digitRegex: RegExp;
    ScorePhoneNumber(phoneNumberText: string): number;
    parse(extResult: ExtractResult): ParseResult;
}
export declare class IpParser extends BaseIpParser {
}
export declare class MentionParser extends BaseSequenceParser {
}
export declare class HashtagParser extends BaseSequenceParser {
}
export declare class EmailParser extends BaseSequenceParser {
}
export declare class URLParser extends BaseSequenceParser {
}
export declare class GUIDParser extends BaseSequenceParser {
}
