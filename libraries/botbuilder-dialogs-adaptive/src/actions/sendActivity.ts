/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog, Configurable } from 'botbuilder-dialogs';
import { Activity, InputHints } from 'botbuilder-core';
import { Expression, ExpressionEngine } from 'botframework-expressions';
import { ActivityProperty } from '../activityProperty';

export interface SendActivityConfiguration extends DialogConfiguration {
    /**
     * Activity or message text to send the user.
     */
    activity?: Partial<Activity> | string;

    /**
     * (Optional) Structured Speech Markup Language (SSML) to speak to the user.
     */
    speak?: string;

    /**
     * (Optional) input hint for the message. Defaults to a value of `InputHints.acceptingInput`.
     */
    inputHint?: InputHints;

    disabled?: string;
}

export class SendActivity<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.SendActivity';

    /**
     * Creates a new `SendActivity` instance.
     * @param activityOrText Activity or message text to send the user.
     * @param speak (Optional) Structured Speech Markup Language (SSML) to speak to the user.
     * @param inputHint (Optional) input hint for the message. Defaults to a value of `InputHints.acceptingInput`.
     */
    public constructor();
    public constructor(activityOrText: Partial<Activity> | string, speak?: string, inputHint?: InputHints);
    public constructor(activityOrText?: Partial<Activity> | string, speak?: string, inputHint?: InputHints) {
        super();
        if (activityOrText) { this._activityProperty.value = activityOrText; }
        if (speak) { this._activityProperty.speak = speak; }
        this._activityProperty.inputHint = inputHint || InputHints.AcceptingInput;
    }

    /**
     * Public getter and setter for declarative activity configuration
     */
    public get activity(): Partial<Activity> | string {
        return this._activityProperty.value;
    }

    public set activity(value: Partial<Activity> | string) {
        this._activityProperty.value = value;
    }

    /**
     * Get an optional expression which if is true will disable this action.
     */
    public get disabled(): string {
        return this._disabled ? this._disabled.toString() : undefined;
    }

    /**
     * Set an optional expression which if is true will disable this action.
     */
    public set disabled(value: string) {
        this._disabled = value ? new ExpressionEngine().parse(value) : undefined;
    }

    private _activityProperty = new ActivityProperty();

    private _disabled: Expression;

    /**
     * (Optional) in-memory state property that the result of the send should be saved to.
     *
     * @remarks
     * This is just a convenience property for setting the dialogs [outputBinding](#outputbinding).
     */
    public configure(config: SendActivityConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        if (!this._activityProperty.hasValue()) {
            // throw new Error(`SendActivity: no activity assigned for action '${this.id}'.`)
            throw new Error(`SendActivity: no activity assigned for action.`)
        }

        // Send activity and return result
        const data = Object.assign({
            utterance: dc.context.activity.text || ''
        }, dc.state, options);
        const activity = this._activityProperty.format(dc, data);
        const result = await dc.context.sendActivity(activity);
        return await dc.endDialog(result);
    }

    protected onComputeId(): string {
        return `SendActivity[${ this._activityProperty.displayLabel }]`;
    }
}