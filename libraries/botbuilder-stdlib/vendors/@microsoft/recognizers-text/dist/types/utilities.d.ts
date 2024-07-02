export declare class FormatUtility {
    static preProcess(query: string, toLower?: boolean): string;
}
export declare class Match {
    constructor(index: number, length: number, value: string, groups: any);
    index: number;
    length: number;
    value: string;
    private innerGroups;
    groups(key: string): {
        value: string;
        index: number;
        length: number;
        captures: string[];
    };
}
export declare class RegExpUtility {
    static getMatches(regex: RegExp, source: string): Array<Match>;
    static getMatchesSimple(regex: RegExp, source: string): Array<Match>;
    static getSafeRegExp(source: string, flags?: string): RegExp;
    static getFirstMatchIndex(regex: RegExp, source: string): {
        matched: boolean;
        index: number;
        value: string;
    };
    static split(regex: RegExp, source: string): string[];
    static isMatch(regex: RegExp, source: string): boolean;
    private static matchGroup;
    private static matchPositiveLookbehind;
    private static matchNegativeLookbehind;
    private static sanitizeGroups(source);
    private static getNextRegex(source, startPos);
    private static getClosePos(source, startPos);
}
export declare class StringUtility {
    static isNullOrWhitespace(input: string): boolean;
    static isNullOrEmpty(input: string): boolean;
    static isWhitespace(input: string): boolean;
    static insertInto(input: string, value: string, index: number): string;
    static removeDiacriticsFromWordBoundaries(input: string): string;
    static removeDiacritics(c: string): string;
    private static readonly diacriticsRemovalMap;
}
