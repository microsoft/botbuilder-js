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
import * as stringTemplate from '../stringTemplate';

export interface SendActivityConfiguration extends DialogConfiguration {
    /**
     * Activity or text of a message to send the user.
     */
    activityOrText: Partial<Activity>|string;

    /**
     * (Optional) SSML that should be spoken to the user for the message.
     */
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
    private _activityOrText: Partial<Activity>|string;
    private _speak: string;
    private _textTemplate?: (data: object) => string;
    private _speakTemplate?: (data: object) => string;

    protected onComputeID(): string {
        let activity: string;
        if (typeof this._activityOrText === 'object') {
            switch (this._activityOrText.type) {
                case ActivityTypes.Message:
                    activity = this._activityOrText.text;
                    break;
                case ActivityTypes.Event:
                    activity = `event:${this._activityOrText.name}`;
                    break;
                default:
                    activity = this._activityOrText.type;
            }
        } else {
            activity = this._activityOrText.toString();
        }
        return `send(activity)`;
    }

    /**
     * Activity or text of a message to send the user.
     */
    public set activityOrText(value: Partial<Activity>|string) {
        this._activityOrText = value;
        if (typeof value == 'string') {
            this._textTemplate = stringTemplate.compile(value);
        } else {
            this._textTemplate = undefined;
        }
    }

    public get activityOrText(): Partial<Activity>|string {
        return this._activityOrText;
    }

    /**
     * (Optional) SSML that should be spoken to the user for the message.
     */
    public set speak(value: string) {
        this._speak = value;
        if (value) {
            this._speakTemplate = stringTemplate.compile(value);
        } else {
            this._speakTemplate = undefined;
        }
    }

    public get speak(): string {
        return this._speak;
    }

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

    /**
     * (Optional) input hint for the message. Defaults to `acceptingInput`.
     */
    public inputHint?: InputHints;

    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        // Slot fill text and speak templates as needed
        const data = dc.state.toJSON();
        let activityOrText = this._textTemplate ? this._textTemplate(data) : this._activityOrText;
        let speak = this._speakTemplate ? this._speakTemplate(data) : this._speak;

        // Send activity and return result
        // - If `resultProperty` has been set, the returned result will be saved to the requested
        //   memory location.
        const result = await dc.context.sendActivity(activityOrText, speak, this.inputHint);
        return await dc.endDialog(result);
    }

    static create(config?: SendActivityConfiguration): SendActivity {
        const dialog = new SendActivity();
        if (config) {
            if (config.activityOrText) { dialog.activityOrText = config.activityOrText }
            if (config.speak) { dialog.speak = config.speak }
            if (config.inputHint) { dialog.inputHint = config.inputHint }
            if (config.resultProperty) { dialog.resultProperty = config.resultProperty }
            Dialog.configure(dialog, config);
        }
        return dialog;
    }
}