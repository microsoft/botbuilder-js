import { BaseTimeParser, ITimeParserConfiguration } from "../baseTime";
import { DateTimeResolutionResult } from "../utilities";
export declare class EnglishTimeParser extends BaseTimeParser {
    constructor(configuration: ITimeParserConfiguration);
    internalParse(text: string, referenceTime: Date): DateTimeResolutionResult;
    private parseIsh(text, referenceTime);
}
