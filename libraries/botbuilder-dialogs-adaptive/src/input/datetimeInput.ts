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
import { ExpressionPropertyValue, ExpressionProperty } from "../expressionProperty";


export interface DatetimeInputConfiguration extends InputDialogConfiguration {
    defaultLocale?: string;
}

export class DatetimeInput extends InputDialog<InputDialogOptions> {

    public defaultLocale: string = null;

    constructor();
    constructor(property: string, prompt: PromptType);
    constructor(property: string, value: ExpressionPropertyValue<any>, prompt: PromptType);
    constructor(property?: string, value?: ExpressionPropertyValue<any> | PromptType, prompt?: PromptType) {
        super();
        if (property) {
            if (!prompt) {
                prompt = value as PromptType;
                value = undefined;
            }
            this.property = property;
            if (value !== undefined) { this.value = new ExpressionProperty(value as any) }
            this.prompt.value = prompt;
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
        const input: object = dc.state.getValue(InputDialog.VALUE_PROPERTY).value;
        const utterance: string = dc.context.activity.text;
        const locale: string = dc.context.activity.locale || this.defaultLocale || "en-us";
        const results: any[] = Recognizers.recognizeDateTime(utterance, locale);

        if (results.length > 0 && results[0].resolution) {
            dc.state.setValue(InputDialog.VALUE_PROPERTY, results[0].resolution.values);
        } else {
            return InputState.unrecognized;
        }
        return InputState.valid;
    }

}