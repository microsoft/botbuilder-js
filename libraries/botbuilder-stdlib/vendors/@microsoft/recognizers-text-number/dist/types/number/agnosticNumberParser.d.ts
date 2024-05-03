import { INumberParserConfiguration, BaseNumberParser } from "./parsers";
export declare enum AgnosticNumberParserType {
    Cardinal = 0,
    Double = 1,
    Fraction = 2,
    Integer = 3,
    Number = 4,
    Ordinal = 5,
    Percentage = 6
}
export declare class AgnosticNumberParserFactory {
    static getParser(type: AgnosticNumberParserType, languageConfiguration: INumberParserConfiguration): BaseNumberParser;
}
