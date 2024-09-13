import { IDurationExtractorConfiguration, IDurationParserConfiguration } from "../baseDuration";
import { BaseNumberExtractor, BaseNumberParser, EnglishCardinalExtractor } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text-number";
import { ICommonDateTimeParserConfiguration } from "../parsers";
export declare class EnglishDurationExtractorConfiguration implements IDurationExtractorConfiguration {
    readonly allRegex: RegExp;
    readonly halfRegex: RegExp;
    readonly followedUnit: RegExp;
    readonly numberCombinedWithUnit: RegExp;
    readonly anUnitRegex: RegExp;
    readonly inexactNumberUnitRegex: RegExp;
    readonly suffixAndRegex: RegExp;
    readonly relativeDurationUnitRegex: RegExp;
    readonly moreThanRegex: RegExp;
    readonly lessThanRegex: RegExp;
    readonly cardinalExtractor: EnglishCardinalExtractor;
    constructor();
}
export declare class EnglishDurationParserConfiguration implements IDurationParserConfiguration {
    readonly cardinalExtractor: BaseNumberExtractor;
    readonly numberParser: BaseNumberParser;
    readonly followedUnit: RegExp;
    readonly suffixAndRegex: RegExp;
    readonly numberCombinedWithUnit: RegExp;
    readonly anUnitRegex: RegExp;
    readonly allDateUnitRegex: RegExp;
    readonly halfDateUnitRegex: RegExp;
    readonly inexactNumberUnitRegex: RegExp;
    readonly unitMap: ReadonlyMap<string, string>;
    readonly unitValueMap: ReadonlyMap<string, number>;
    readonly doubleNumbers: ReadonlyMap<string, number>;
    constructor(config: ICommonDateTimeParserConfiguration);
}
