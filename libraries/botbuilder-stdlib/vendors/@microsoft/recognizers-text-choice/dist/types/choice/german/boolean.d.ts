import { IBooleanExtractorConfiguration } from "../extractors";
export declare class GermanBooleanExtractorConfiguration implements IBooleanExtractorConfiguration {
    readonly regexTrue: RegExp;
    readonly regexFalse: RegExp;
    readonly tokenRegex: RegExp;
    readonly onlyTopMatch: boolean;
    constructor(onlyTopMatch?: boolean);
}
