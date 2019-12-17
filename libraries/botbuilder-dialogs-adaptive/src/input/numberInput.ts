/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { InputDialogConfiguration, InputDialog, InputDialogOptions, InputState, PromptType } from "./inputDialog";
import { DialogContext } from "botbuilder-dialogs";
import * as Recognizers from '@microsoft/recognizers-text-number';
import { Activity } from "botbuilder-core";
import { ExpressionProperty, ExpressionPropertyValue } from "../expressionProperty";

export interface NumberInputConfiguration extends InputDialogConfiguration {
    outputFormat?: NumberOutputFormat;
    defaultLocale?: string;
}

export enum NumberOutputFormat {
    float = 'float',
    integer = 'integer'
}

export class NumberInput extends InputDialog<InputDialogOptions> {

    public outputFormat = NumberOutputFormat.float;

    /**
     * The prompts default locale that should be recognized.
     */
    public defaultLocale?: string;

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

    public configure(config: NumberInputConfiguration): this {
        return super.configure(config);
    }

    protected onComputeId(): string {
        return `NumberInput[${this.prompt.value.toString()}]`;
    }

    protected async onRecognizeInput(dc: DialogContext, consultation: boolean): Promise<InputState> {
        // Recognize input if needed
        let input: any = dc.state.getValue(InputDialog.VALUE_PROPERTY).value;
        if (typeof input !== 'number') {
            // Find locale to use
            const activity: Activity = dc.context.activity;
            const locale = activity.locale || this.defaultLocale || 'en-us';

            // Recognize input
            const results: any = Recognizers.recognizeNumber(input, locale);
            if (results.length > 0 && results[0].resolution) {
                input = parseFloat(results[0].resolution.value);
            } else {
                return InputState.unrecognized;
            }
        }

        // Format output and return success
        switch (this.outputFormat) {
            case NumberOutputFormat.float:
            default:
                dc.state.setValue(InputDialog.VALUE_PROPERTY, input);
                break;
            case NumberOutputFormat.integer:
                dc.state.setValue(InputDialog.VALUE_PROPERTY, Math.floor(input));
                break;
        }

        return InputState.valid;
    }
}