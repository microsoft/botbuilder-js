/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand } from '../dialogCommand';
import { DialogContext } from '../dialogContext';
import { DialogTurnResult, DialogConfiguration, Dialog } from '../dialog';
import { Activity, InputHints, ActivityTypes } from 'botbuilder-core';
import { ActivityProperty } from '../activityProperty';

export interface SendActivityConfiguration extends DialogConfiguration {
    speak?: string;

    /**
     * (Optional) input hint for the message. Defaults to `acceptingInput`.
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

    protected onComputeID(): string {
        return `send(${this.activity.displayLabel})`;
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
        this.outputBinding = value;
    }

    public get resultProperty(): string {
        return this.outputBinding;
    }

    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        if (!this.activity.hasValue()) {
            throw new Error(`SendActivity: no activity assigned for step '${this.id}'.`) 
        } 

        // Send activity and return result
        // - If `resultProperty` has been set, the returned result will be saved to the requested
        //   memory location.
        console.log(JSON.stringify(dc.state.toJSON().dialog));
        const activity = this.activity.format(dc, { utterance: dc.context.activity.text || '' });
        const result = await dc.context.sendActivity(activity);
        return await dc.endDialog(result);
    }

    static create(activityOrText: Partial<Activity>|string, config?: SendActivityConfiguration): SendActivity;
    static create(activityOrText: Partial<Activity>|string, speak?: string, config?: SendActivityConfiguration): SendActivity;
    static create(activityOrText: Partial<Activity>|string, speak?: string|SendActivityConfiguration, config?: SendActivityConfiguration): SendActivity {
        if (typeof speak == 'object') {
            config = speak;
            speak = config.speak;
        }
        const dialog = new SendActivity();
        dialog.activity.value = activityOrText;
        dialog.activity.speak = speak;
        if (config) {
            if (config.inputHint) { dialog.activity.inputHint = config.inputHint }
            if (config.resultProperty) { dialog.resultProperty = config.resultProperty }
            Dialog.configure(dialog, config);
        }
        return dialog;
    }
}