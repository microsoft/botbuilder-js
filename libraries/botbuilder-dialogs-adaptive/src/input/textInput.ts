/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { InputDialogConfiguration, InputDialog, InputDialogOptions, InputState } from "./inputDialog";
import { DialogContext } from "botbuilder-dialogs";
import { Activity } from "botbuilder-core";

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
    constructor(property: string, prompt: string|Partial<Activity>);
    constructor(property: string, entityName: string, prompt: string|Partial<Activity>);
    constructor(property?: string, entityName?: string|Partial<Activity>, prompt?: string|Partial<Activity>) {
        super();
        if (property) {
            this.property = property;
            if(!prompt) {
                this.prompt.value = entityName;
            } else {
                this.entityName = entityName as string;
                this.prompt.value = prompt;
            }
        }
    }

    public configure(config: TextInputConfiguration): this {
        return super.configure(config);
    }

    protected onComputeID(): string {
        return `textInput[${this.bindingPath()}]`;
    }
    
    protected async onRecognizeInput(dc: DialogContext, consultation: boolean): Promise<InputState> {
        // Check for consultation
        if (consultation) {
            // Text inputs by default allow .
            // - It doesn't matter what we return here as long as it isn't "InputState.valid".
            return InputState.unrecognized;
        }

        // Treat input as a string
        let input: string = dc.state.getValue(InputDialog.INPUT_PROPERTY).toString();

        // Format input
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
        dc.state.setValue(InputDialog.INPUT_PROPERTY, input);
        return input.length > 0 ? InputState.valid : InputState.unrecognized;
    }
}