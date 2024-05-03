import { ExtractResult } from "./extractors";
export interface IParser {
    parse(extResult: ExtractResult): ParseResult | null;
}
export declare class ParseResult extends ExtractResult {
    constructor(er?: ExtractResult);
    value?: any;
    resolutionStr?: string;
}
