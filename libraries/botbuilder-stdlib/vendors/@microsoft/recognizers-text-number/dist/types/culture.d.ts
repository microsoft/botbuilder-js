import { Culture as BaseCulture, CultureInfo as BaseCultureInfo } from "botbuilder-stdlib/vendors/@microsoft/recognizers-text";
import { BigNumber } from 'bignumber.js/bignumber';
import { LongFormatType } from "./number/models";
export declare class Culture extends BaseCulture {
    static readonly supportedCultures: Culture[];
    readonly longFormat: LongFormatType;
    private constructor();
}
export declare class CultureInfo extends BaseCultureInfo {
    format(value: number | BigNumber): string;
}
