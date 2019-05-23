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
    pattern?: string|RegExp;
    minLength?: number;
    maxLength?: number;
    outputFormat?: TextOutputFormat;
}

export interface TextInputOptions extends InputDialogOptions {
    minLength?: number;
    maxLength?: number;
}

export enum TextOutputFormat {
    none = 'none',
    trim = 'trim',
    lowercase = 'lowercase',
    uppercase = 'uppercase'
}

export class TextInput extends InputDialog<TextInputOptions> {

    public pattern?: RegExp;

    public minLength?: number;

    public maxLength?: number;

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

    public set minLengthProperty(value: string) {
        this.inputProperties['minLength'] = value;
    }

    public get minLengthProperty(): string {
        return this.inputProperties['minLength'];
    }

    public set maxLengthProperty(value: string) {
        this.inputProperties['maxLength'] = value;
    }

    public get maxLengthProperty(): string {
        return this.inputProperties['maxLength'];
    }

    public configure(config: TextInputConfiguration): this {
        for(const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'pattern':
                        this.pattern = typeof value == 'string' ? new RegExp(value, 'i') : value;
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    protected onComputeID(): string {
        return `textInput[${this.bindingPath()}]`;
    }

    protected onInitializeOptions(options: TextInputOptions): TextInputOptions {
        if (options.minLength == undefined && this.minLength != undefined) { options.minLength = this.minLength }
        if (options.maxLength == undefined && this.maxLength != undefined) { options.maxLength = this.maxLength }
        return super.onInitializeOptions(options);
    }
    
    protected async onRecognizeInput(dc: DialogContext, options: TextInputOptions, consultation: boolean): Promise<InputState> {
        // Check for consultation
        if (consultation && !this.pattern) {
            // Without a pattern defined we want to let other dialogs potentially interrupt 
            // the text prompt.
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

        // Perform validations
        if (this.pattern && !this.pattern.test(input)) {
            return InputState.invalid;
        }

        if (typeof options.minLength == 'number' && input.length < options.minLength) {
            return InputState.invalid;
        }

        if (typeof options.maxLength == 'number' && input.length > options.maxLength) {
            return InputState.invalid;
        }

        // Save formated value and return success
        dc.state.setValue(InputDialog.INPUT_PROPERTY, input);
        return InputState.valid;
    }
}