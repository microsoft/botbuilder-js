import { IDateTimeUtilityConfiguration } from "../utilities";
import { BaseDateParserConfiguration } from "../parsers";
export declare class SpanishDateTimeUtilityConfiguration implements IDateTimeUtilityConfiguration {
    readonly agoRegex: RegExp;
    readonly laterRegex: RegExp;
    readonly inConnectorRegex: RegExp;
    readonly rangeUnitRegex: RegExp;
    readonly amDescRegex: RegExp;
    readonly pmDescRegex: RegExp;
    readonly amPmDescRegex: RegExp;
    constructor();
}
export declare class SpanishCommonDateTimeParserConfiguration extends BaseDateParserConfiguration {
    constructor();
}
