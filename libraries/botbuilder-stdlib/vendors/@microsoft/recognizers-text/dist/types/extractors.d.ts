export interface IExtractor {
    extract(input: string): Array<ExtractResult>;
}
export declare class ExtractResult {
    start: number;
    length: number;
    text: string;
    type: string;
    data?: any;
    static isOverlap(erA: ExtractResult, erB: ExtractResult): boolean;
    static isCover(er1: ExtractResult, er2: ExtractResult): boolean;
    static getFromText(source: string): ExtractResult;
}
