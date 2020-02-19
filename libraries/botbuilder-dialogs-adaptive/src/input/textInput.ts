/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext } from 'botbuilder-dialogs';
import { InputDialogConfiguration, InputDialog, InputState } from './inputDialog';
import { StringExpression } from '../expressionProperties';

export interface TextInputConfiguration extends InputDialogConfiguration {
    outputFormat?: string;
}

export class TextInput extends InputDialog {

    public static declarativeType = 'Microsoft.TextInput';

    public outputFormat: StringExpression;

    public configure(config: TextInputConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'outputFormat':
                        this.outputFormat = new StringExpression(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    protected onComputeId(): string {
        return `TextInput[${ this.prompt.toString() }]`;
    }

    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Treat input as a string
        let input: string = dc.state.getValue(InputDialog.VALUE_PROPERTY).toString();

        if (this.outputFormat) {
            const value = this.outputFormat.getValue(dc.state);
            input = value.toString();
        }

        // Save formated value and ensure length > 0
        dc.state.setValue(InputDialog.VALUE_PROPERTY, input);
        return input.length > 0 ? InputState.valid : InputState.unrecognized;
    }
}