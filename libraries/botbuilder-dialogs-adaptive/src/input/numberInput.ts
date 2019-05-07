/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogTurnResult, DialogContext, DialogConfiguration, DialogDependencies, DialogCommand, NumberPrompt } from 'botbuilder-dialogs';
import { ActivityProperty } from '../activityProperty';
import { Activity } from 'botbuilder-core';

export class NumberInput extends DialogCommand implements DialogDependencies {
    private numberPrompt = new NumberPrompt();

    constructor(property?: string, activity?: string|Partial<Activity>) {
        super();
        this.property = property;
        this.activity.value = activity;
    }

    protected onComputeID(): string {
        return `numberInput[${this.bindingPath()}]`;
    }

    public getDependencies(): Dialog[] {
        // Update prompts ID before returning.
        this.numberPrompt.id = this.id + ':prompt';
        return [this.numberPrompt];
    }

    public configure(config: DialogConfiguration): this {
        return super.configure(config);
    }

    /**
     * Activity to send the user.
     */
    public set prompt(value: string|Partial<Activity>) {
        this.activity.value = value;
    }

    public get prompt(): string|Partial<Activity> {
        return this.activity.value;
    }
    
    public activity = new ActivityProperty();

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
        if (typeof value !== 'number') {
            const activity = this.activity.format(dc, { utterance: dc.context.activity.text || '' });
            return await dc.prompt(this.numberPrompt.id, activity);
        } else {
            return await dc.endDialog();
        }
    }
}