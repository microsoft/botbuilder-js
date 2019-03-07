/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { InputDialog, InputDialogConfiguration } from "./inputDialog";
import { Activity, InputHints } from "botbuilder-core";
import { TextSlot, TextSlotConfiguration } from "./textSlot";
import { PlanningDialog } from "../planningDialog";
import { DoStepsRule } from "../rules";
import { CallDialog, EndDialog } from "../steps";

export interface TextInputConfiguration extends InputDialogConfiguration, TextSlotConfiguration {

}

export class TextInput extends InputDialog {

    constructor(property?: string, activity?: string|Partial<Activity>, speak?: string, inputHint?: InputHints) {
        super(new TextSlot('value'), property, activity, speak, inputHint);
    }

    protected onComputeID(): string {
        return `textInput[${this.bindingPath()}]`;
    }

    public configure(config: TextInputConfiguration): this {
        // Divert slot settings to slot
        ['minLength', 'minLengthProperty', 'pattern', 'patternProperty', 'formatValue'].forEach((key) => {
            if (config.hasOwnProperty(key)) {
                this.slot.configure({ [key]: config[key] });
                delete config[key];
            }
        });
        return super.configure(config);
    }
}
