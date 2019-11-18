/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { InputDialogConfiguration, InputDialog, InputDialogOptions, InputState, PromptType } from "./inputDialog";
import { DialogContext } from "botbuilder-dialogs";
import * as Recognizers from '@microsoft/recognizers-text-date-time';


export interface DatetimeInputConfiguration extends InputDialogConfiguration {
    defaultLocale?: string;
}

export class DatetimeInput extends InputDialog<InputDialogOptions> {

    public defaultLocale: string = null;

    constructor();
    constructor(defaultLocale: string);
    constructor(defaultLocale?: string) {
        super();
        if (defaultLocale) {
            this.defaultLocale = defaultLocale;
        }
    }

    public configure(config: DatetimeInputConfiguration): this {
        return super.configure(config);
    }

    protected onComputeId(): string {
        return `DatetimeInput[locale:${this.defaultLocale}]`;
    }

    protected async onRecognizeInput(dc: DialogContext, consultation: boolean): Promise<InputState> {
        // Recognize input and filter out non-attachments
        const input: object = dc.state.getValue(InputDialog.INPUT_PROPERTY);
        const utterance: string = dc.context.activity.text;
        const locale: string = dc.context.activity.locale || this.defaultLocale || "en-us";
        const results: any[] = Recognizers.recognizeDateTime(utterance, locale);

        if (results.length > 0 && results[0].resolution) {
            dc.state.setValue(InputDialog.INPUT_PROPERTY, results[0].resolution.values);
        } else {
            return InputState.unrecognized;
        }
        return InputState.valid;
    }

}