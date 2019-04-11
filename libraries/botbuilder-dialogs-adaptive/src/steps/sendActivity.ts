/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, Dialog, DialogCommand, DialogContext } from 'botbuilder-dialogs';
import { Activity, InputHints } from 'botbuilder-core';
import { ActivityProperty } from '../activityProperty';

export interface SendActivityConfiguration extends DialogConfiguration {
    /**
     * Activity or message text to send the user. 
     */
    activityOrText?: Partial<Activity>|string;

    /**
     * (Optional) Structured Speech Markup Language (SSML) to speak to the user.
     */
    speak?: string;

    /**
     * (Optional) input hint for the message. Defaults to a value of `InputHints.acceptingInput`.
     */
    inputHint?: InputHints;

    /**
     * (Optional) in-memory state property that the result of the send should be saved to.
     * 
     * @remarks
     * This is just a convenience property for setting the dialogs [outputBinding](#outputbinding). 
     */
    resultProperty?: string;
}

export class SendActivity extends DialogCommand {

    /**
     * Creates a new `SendActivity` instance.
     * @param activityOrText Activity or message text to send the user. 
     * @param speak (Optional) Structured Speech Markup Language (SSML) to speak to the user.
     * @param inputHint (Optional) input hint for the message. Defaults to a value of `InputHints.acceptingInput`.
     */
    constructor();
    constructor(activityOrText: Partial<Activity>|string, speak?: string, inputHint?: InputHints);
    constructor(activityOrText?: Partial<Activity>|string, speak?: string, inputHint?: InputHints) {
        super();
        if (activityOrText) { this.activity.value = activityOrText }
        if (speak) { this.activity.speak = speak }
        this.activity.inputHint = inputHint || InputHints.AcceptingInput;
    }

    protected onComputeID(): string {
        return `send[${this.hashedLabel(this.activity.displayLabel)}]`;
    }

    /**
     * Activity to send the user.
     */
    public activity = new ActivityProperty();

    /**
     * (Optional) in-memory state property that the result of the send should be saved to.
     * 
     * @remarks
     * This is just a convenience property for setting the dialogs [outputBinding](#outputbinding). 
     */
    public set resultProperty(value: string) {
        this.outputProperty = value;
    }

    public get resultProperty(): string {
        return this.outputProperty;
    }

    public configure(config: SendActivityConfiguration): this {
        return super.configure(config);
    }
    
    protected async onRunCommand(dc: DialogContext, options: object): Promise<DialogTurnResult> {
        if (!this.activity.hasValue()) {
            throw new Error(`SendActivity: no activity assigned for step '${this.id}'.`) 
        } 

        // Send activity and return result
        // - If `resultProperty` has been set, the returned result will be saved to the requested
        //   memory location.
        const data = Object.assign({
            utterance: dc.context.activity.text || ''
        }, dc.state.toJSON(),  options);
        const activity = this.activity.format(dc, data);
        const result = await dc.context.sendActivity(activity);
        return await dc.endDialog(result);
    }
}