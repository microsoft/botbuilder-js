/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { InputDialogConfiguration, InputDialog, InputDialogOptions, InputState, PromptType } from "./inputDialog";
import { DialogContext } from "botbuilder-dialogs";
import { ExpressionPropertyValue, ExpressionProperty } from "../expressionProperty";

export interface TextInputConfiguration extends InputDialogConfiguration {
    outputFormat?: TextOutputFormat;
}

export enum TextOutputFormat {
    none = 'none',
    trim = 'trim',
    lowercase = 'lowercase',
    uppercase = 'uppercase'
}

export class TextInput extends InputDialog<InputDialogOptions> {

    public outputFormat = TextOutputFormat.none;

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

    public configure(config: TextInputConfiguration): this {
        return super.configure(config);
    }

    protected onComputeId(): string {
        return `TextInput[]`;
    }

    protected async onRecognizeInput(dc: DialogContext, consultation: boolean): Promise<InputState> {
        // Check for consultation
        if (consultation) {
            // Text inputs by default allow other dialogs to interrupt them.
            // - It doesn't matter what we return here as long as it isn't "InputState.valid".
            return InputState.unrecognized;
        }

        // Treat input as a string
        let input: string = dc.state.getValue(InputDialog.VALUE_PROPERTY).toString();

        // Format output
        switch (this.outputFormat) {
            case TextOutputFormat.trim:
                input = input.trim();
                break;
            case TextOutputFormat.lowercase:
                input = input.trim().toLowerCase();
                break;
            case TextOutputFormat.uppercase:
                input = input.trim().toUpperCase();
                break;
        }

        // Save formated value and ensure length > 0
        dc.state.setValue(InputDialog.VALUE_PROPERTY, input);
        return input.length > 0 ? InputState.valid : InputState.unrecognized;
    }
}