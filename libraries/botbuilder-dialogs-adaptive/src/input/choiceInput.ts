/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogTurnResult, DialogContext, DialogConfiguration, DialogDependencies, DialogCommand, ChoicePrompt, FoundChoice, DialogReason } from 'botbuilder-dialogs';
import { ActivityProperty } from '../activityProperty';
import { Activity } from 'botbuilder-core';

export class ChoiceInput extends DialogCommand implements DialogDependencies {
    private prompt = new ChoicePrompt();

    constructor(property: string, activity: string|Partial<Activity>, choices: string|string[]) {
        super();
        this.property = property;
        this.activity.value = activity;
        if (typeof choices == 'string') {
            this.choicesProperty = choices;
        } else {
            this.choices = choices;
        }
    }

    protected onComputeID(): string {
        return `choiceInput[${this.bindingPath()}]`;
    }

    public getDependencies(): Dialog[] {
        // Update prompts ID before returning.
        this.prompt.id = this.id + ':prompt';
        return [this.prompt];
    }

    public configure(config: DialogConfiguration): this {
        return super.configure(config);
    }

    /**
     * Activity to send the user.
     */
    public activity = new ActivityProperty();

    public choices: string[];

    public choicesProperty: string;

    /**
     * (Optional) data binds the called dialogs input & output to the given property.
     * 
     * @remarks
     * The bound properties current value will be passed to the called dialog as part of its 
     * options and will be accessible within the dialog via `dialog.options.value`. The result
     * returned from the called dialog will then be copied to the bound property.
     */
    public set property(value: string) {
        this.inputProperties['value'] = value;
        this.outputProperty = value;
    }

    public get property(): string {
       return this.inputProperties['value']; 
    }

    public async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        // Check value and only call if missing
        const value = dc.state.getValue(this.property);
        if (value === undefined) {
            // Get list of choices
            let choices = this.choices;
            if (!Array.isArray(choices) && this.choicesProperty) {
                const val = dc.state.getValue(this.choicesProperty);
                if (Array.isArray(val)) {
                    choices = val
                } else if (typeof val == 'object') {
                    choices = [];
                    for(const key in val) {
                        if (val.hasOwnProperty(key)) {
                            choices.push(key);
                        }
                    }
                }
            }


            // Ensure choices
            if (!Array.isArray(choices)) {
                return await dc.cancelAllDialogs('error', new Error(`ChoiceInput: no choices found for "${this.property}" prompt.`))
            }

            // Send prompt
            const activity = this.activity.format(dc, { utterance: dc.context.activity.text || '' });
            return await dc.prompt(this.prompt.id, activity, choices);
        } else {
            return await dc.endDialog();
        }
    }

    public async resumeDialog(dc: DialogContext, reason: DialogReason, result: FoundChoice): Promise<DialogTurnResult> {
        // Only return value field
        return dc.endDialog(result ? result.value : undefined);
    }
}