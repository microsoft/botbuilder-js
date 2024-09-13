import { BaseTimeParser, ITimeParserConfiguration } from "../baseTime";
import { DateTimeResolutionResult } from "../utilities";
export declare class FrenchTimeParser extends BaseTimeParser {
    constructor(config: ITimeParserConfiguration);
    internalParse(text: string, referenceTime: Date): DateTimeResolutionResult;
    parseIsh(text: string, referenceTime: Date): DateTimeResolutionResult;
}
