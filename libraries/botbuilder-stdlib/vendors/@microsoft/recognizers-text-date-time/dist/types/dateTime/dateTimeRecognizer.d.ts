import { ModelResult, Recognizer } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { IDateTimeModel } from "./models";
export declare enum DateTimeOptions {
    None = 0,
    SkipFromToMerge = 1,
    SplitDateAndTime = 2,
    Calendar = 4,
}
export declare function recognizeDateTime(query: string, culture: string, options?: DateTimeOptions, referenceDate?: Date, fallbackToDefaultCulture?: boolean): Array<ModelResult>;
export default class DateTimeRecognizer extends Recognizer<DateTimeOptions> {
    constructor(culture: string, options?: DateTimeOptions, lazyInitialization?: boolean);
    protected InitializeConfiguration(): void;
    protected IsValidOptions(options: number): boolean;
    getDateTimeModel(culture?: string, fallbackToDefaultCulture?: boolean): IDateTimeModel;
}
